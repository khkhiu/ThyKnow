// public/miniapp/js/app/utils/elements.ts

/**
 * Show a DOM element by ID
 * @param id - Element ID
 */
export function showElement(id: string): void {
  const element = document.getElementById(id);
  if (element) {
    element.style.display = 'block';
  }
}

/**
 * Hide a DOM element by ID
 * @param id - Element ID
 */
export function hideElement(id: string): void {
  const element = document.getElementById(id);
  if (element) {
    element.style.display = 'none';
  }
}

/**
 * Get element value by ID
 * @param id - Element ID
 * @returns Element value
 */
export function getElementValue(id: string): string {
  const element = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement;
  return element ? element.value : '';
}

/**
 * Set element value by ID
 * @param id - Element ID
 * @param value - Value to set
 */
export function setElementValue(id: string, value: string): void {
  const element = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement;
  if (element) {
    element.value = value;
  }
}

/**
 * Clear element value by ID
 * @param id - Element ID
 */
export function clearElementValue(id: string): void {
  setElementValue(id, '');
}

/**
 * Add a class to an element
 * @param id - Element ID
 * @param className - Class to add
 */
export function addElementClass(id: string, className: string): void {
  const element = document.getElementById(id);
  if (element) {
    element.classList.add(className);
  }
}

/**
 * Remove a class from an element
 * @param id - Element ID
 * @param className - Class to remove
 */
export function removeElementClass(id: string, className: string): void {
  const element = document.getElementById(id);
  if (element) {
    element.classList.remove(className);
  }
}

/**
 * Set element text content by selector
 * @param selector - CSS selector
 * @param text - Text to set
 */
export function setElementText(selector: string, text: string): void {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = text;
  }
}

/**
 * Set inner HTML content by ID
 * @param id - Element ID
 * @param html - HTML content
 */
export function setInnerHTML(id: string, html: string): void {
  const element = document.getElementById(id);
  if (element) {
    element.innerHTML = html;
  }
}

/**
 * Disable element by ID
 * @param id - Element ID
 * @param disabled - Whether to disable the element
 */
export function setElementDisabled(id: string, disabled: boolean): void {
  const element = document.getElementById(id) as HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement;
  if (element) {
    element.disabled = disabled;
  }
}

/**
 * Scroll element into view with smooth behavior
 * @param id - Element ID
 * @param options - Scroll options
 */
export function scrollIntoView(id: string, options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center' }): void {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView(options);
  }
}