/**
 * UI Updater - Secure DOM manipulation
 * Replaces innerHTML usage with safe DOM methods to prevent XSS
 */

import { securityUtils } from './security-utils.js';

export class UIUpdater {
    constructor() {
        this.rateLimiter = securityUtils.createRateLimiter(100, 60000); // 100 requests per minute
    }

    /**
     * Safely update table body content
     */
    updateTableBody(tbody, events) {
        if (!tbody || !Array.isArray(events)) return;

        // Rate limiting check
        if (!this.rateLimiter.check('table-update')) {
            console.warn('Rate limited: too many table updates');
            return;
        }

        // Clear existing content safely
        this.clearElement(tbody);

        // Add new rows safely
        events.forEach(event => {
            const row = this.createEventRow(event);
            if (row) {
                tbody.appendChild(row);
            }
        });
    }

    /**
     * Create event row safely
     */
    createEventRow(event) {
        const row = document.createElement('tr');
        
        // Validate event data
        const validation = securityUtils.validateInput(JSON.stringify(event), {
            maxLength: 10000,
            forbiddenPatterns: [/<script/i, /javascript:/i]
        });

        if (!validation.valid) {
            securityUtils.logSecurityEvent('invalid_event_data', { event: event.id });
            return null;
        }

        // Create cells safely
        const cells = [
            this.createCell(event.id || 'N/A'),
            this.createCell(event.status || 'NORMAL'),
            this.createCell(event.change || '0%'),
            this.createCell(event.description || 'No description')
        ];

        cells.forEach(cell => row.appendChild(cell));
        return row;
    }

    /**
     * Create cell safely
     */
    createCell(content) {
        const cell = document.createElement('td');
        securityUtils.setTextContent(cell, content);
        return cell;
    }

    /**
     * Clear element content safely
     */
    clearElement(element) {
        if (element) {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        }
    }

    /**
     * Update status element safely
     */
    updateStatus(element, message, color = '#333') {
        if (!element) return;

        // Validate message
        const validation = securityUtils.validateInput(message, {
            maxLength: 500,
            forbiddenPatterns: [/<script/i, /javascript:/i]
        });

        if (!validation.valid) {
            securityUtils.logSecurityEvent('invalid_status_message', { message });
            message = 'Status update error';
        }

        // Create safe status content
        const statusContainer = document.createElement('span');
        securityUtils.setTextContent(statusContainer, message);
        
        // Clear and add new content
        this.clearElement(element);
        element.appendChild(statusContainer);
        
        if (color) {
            element.style.color = color;
        }
    }

    /**
     * Create status with links safely
     */
    createStatusWithLinks(message, links) {
        const container = document.createElement('span');
        
        // Split message by link placeholders
        const parts = message.split(/\{(\w+)\}/);
        
        parts.forEach((part, index) => {
            if (index % 2 === 0) {
                // Regular text
                if (part) {
                    container.appendChild(document.createTextNode(part));
                }
            } else {
                // Link placeholder
                const link = links[part];
                if (link) {
                    const linkElement = document.createElement('a');
                    linkElement.href = '#';
                    linkElement.textContent = link.text;
                    linkElement.style.color = link.color || '#333';
                    
                    if (link.onclick) {
                        linkElement.addEventListener('click', (e) => {
                            e.preventDefault();
                            link.onclick();
                        });
                    }
                    
                    container.appendChild(linkElement);
                }
            }
        });
        
        return container;
    }

    /**
     * Update status with links safely
     */
    updateStatusWithLinks(element, message, links) {
        if (!element) return;

        // Validate message and links
        const validation = securityUtils.validateInput(message, {
            maxLength: 500,
            forbiddenPatterns: [/<script/i, /javascript:/i]
        });

        if (!validation.valid) {
            securityUtils.logSecurityEvent('invalid_status_message', { message });
            return;
        }

        // Clear and add new content
        this.clearElement(element);
        const statusContent = this.createStatusWithLinks(message, links);
        element.appendChild(statusContent);
    }

    /**
     * Update banner safely
     */
    updateBanner(banner, content) {
        if (!banner) return;

        // Validate content
        const validation = securityUtils.validateInput(content, {
            maxLength: 2000,
            forbiddenPatterns: [/<script/i, /javascript:/i]
        });

        if (!validation.valid) {
            securityUtils.logSecurityEvent('invalid_banner_content', { content });
            return;
        }

        // Create safe banner content
        const bannerContent = document.createElement('div');
        bannerContent.className = 'banner-content';
        securityUtils.setTextContent(bannerContent, content);

        // Clear and add new content
        this.clearElement(banner);
        banner.appendChild(bannerContent);
    }

    /**
     * Update widget safely
     */
    updateWidget(widget, content) {
        if (!widget) return;

        // Validate content
        const validation = securityUtils.validateInput(content, {
            maxLength: 5000,
            forbiddenPatterns: [/<script/i, /javascript:/i]
        });

        if (!validation.valid) {
            securityUtils.logSecurityEvent('invalid_widget_content', { content });
            return;
        }

        // Create safe widget content
        const widgetContent = document.createElement('div');
        widgetContent.className = 'widget-content';
        securityUtils.setTextContent(widgetContent, content);

        // Clear and add new content
        this.clearElement(widget);
        widget.appendChild(widgetContent);
    }

    /**
     * Update container safely
     */
    updateContainer(container, content) {
        if (!container) return;

        // Validate content
        const validation = securityUtils.validateInput(content, {
            maxLength: 10000,
            forbiddenPatterns: [/<script/i, /javascript:/i]
        });

        if (!validation.valid) {
            securityUtils.logSecurityEvent('invalid_container_content', { content });
            return;
        }

        // Clear container safely
        this.clearElement(container);
        
        // Add new content as text node
        if (content) {
            container.appendChild(document.createTextNode(content));
        }
    }
}

// Export singleton instance
export const uiUpdater = new UIUpdater();


