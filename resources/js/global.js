/**
 * Application Frontend MAVILLE - JavaScript Global
 */

const API_BASE_URL = window.location.origin

// 1. Systeme de notification Toast Global
window.showToast = function (message, type = 'error') {
  const toastContainer = document.getElementById('toast-container')
  if (!toastContainer) return

  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.textContent = message

  toastContainer.appendChild(toast)

  setTimeout(() => {
    toast.remove()
  }, 4000)
}

// 2. Client API HTTP Centralisé (Accessible depuis tous les scripts)
window.apiFetch = async function (endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('maville_token')
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config = { method, headers }
  if (body) {
    config.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.errors?.[0]?.message || 'Une erreur est survenue')
    }

    return data
  } catch (error) {
    window.showToast(error.message, 'error')
    throw error
  }
}

// 3. Interactions Globale (Menu Burger Responsive)
document.addEventListener('DOMContentLoaded', () => {
  const burgerBtn = document.getElementById('burger-btn')
  const navMenu = document.getElementById('nav-menu')
  const menuOverlay = document.getElementById('menu-overlay')
  const navLinks = document.querySelectorAll('.nav-menu a')

  function toggleMenu() {
    if (!burgerBtn || !navMenu) return
    burgerBtn.classList.toggle('is-active')
    navMenu.classList.toggle('is-active')
    menuOverlay?.classList.toggle('is-active')
    document.body.style.overflow = navMenu.classList.contains('is-active') ? 'hidden' : ''
  }

  if (burgerBtn && navMenu) {
    burgerBtn.addEventListener('click', toggleMenu)
    menuOverlay?.addEventListener('click', toggleMenu)

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('is-active')) {
          toggleMenu()
        }
      })
    })
  }
})