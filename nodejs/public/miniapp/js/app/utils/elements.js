// js/app/utils/elements.js - DOM element helper functions

import { ELEMENTS } from '../config.js';

/**
 * Show a DOM element by ID
 * @param {string} id - Element ID
 */
export function showElement(id) {
  const element = document.getElementById(id);
  if (element) {
    element.style.display = 'block';
  }
}

/**
 * Hide a DOM element by ID
 * @param {string} id - Element ID
 */
export function hideElement(id) {
  const element = document.getElementById(id);
  if (element) {
    element.style.display = 'none';
  }
}

/**
 * Get element value by ID
 * @param {string} id - Element ID
 * @returns {string} Element value
 */
export function getElementValue(id) {
  const element = document.getElementById(id);
  return element ? element.value : '';
}

/**
 * Set element value by ID
 * @param {string} id - Element ID
 * @param {string} value - Value to set
 */
export function setElementValue(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.value = value;
  }
}

/**
 * Clear element value by ID
 * @param {string} id - Element ID
 */
export function clearElementValue(id) {
  setElementValue(id, '');
}

/**
 * Add a class to an element
 * @param {string} id - Element ID
 * @param {string} className - Class to add
 */
export function addElementClass(id, className) {
  const element = document.getElementById(id);
  if (element) {
    element.classList.add(className);
  }
}

/**
 * Remove a class from an element
 * @param {string} id - Element ID
 * @param {string} className - Class to remove
 */
export function removeElementClass(id, className) {
  const element = document.getElementById(id);
  if (element) {
    element.classList.remove(className);
  }
}

/**
 * Set element text content by selector
 * @param {string} selector - CSS selector
 * @param {string} text - Text to set
 */
export function setElementText(selector, text) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = text;
  }
}

/**
 * Set inner HTML content by ID
 * @param {string} id - Element ID
 * @param {string} html - HTML content
 */
export function setInnerHTML(id, html) {
  const element = document.getElementById(id);
  if (element) {
    element.innerHTML = html;
  }
}

/**
 * Disable element by ID
 * @param {string} id - Element ID
 * @param {boolean} disabled - Whether to disable the element
 */
export function setElementDisabled(id, disabled) {
  const element = document.getElementById(id);
  if (element) {
    element.disabled = disabled;
  }
}

/**
 * Scroll element into view with smooth behavior
 * @param {string} id - Element ID
 * @param {Object} options - Scroll options
 */
export function scrollIntoView(id, options = { behavior: 'smooth', block: 'center' }) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView(options);
  }
}