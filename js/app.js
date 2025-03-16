import { AuthService } from './services/auth.js';
import { MovieService } from './services/movie.js';
import { Router } from './router.js';
import { showMessage } from './utils.js';

class App {
    constructor() {
        this.authService = new AuthService();
        this.movieService = new MovieService();
        this.router = new Router();

        // Rendre l'instance de l'app disponible globalement pour les gestionnaires d'événements
        window.app = this;

        // Attendre que le DOM soit chargé avant d'initialiser l'application
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeActiveLink();
            this.setupEventListeners();
            this.updateNavigation();
            this.router.init();
        });
    }

    initializeActiveLink() {
        const activePage = localStorage.getItem('activePage') || 'home';
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            if (link.dataset.page === activePage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    setupEventListeners() {
        // Navigation
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Retirer la classe active de tous les liens
                navLinks.forEach(l => l.classList.remove('active'));
                // Ajouter la classe active sur le lien cliqué
                e.target.classList.add('active');
                // Sauvegarder la page active dans le localStorage
                const page = e.target.dataset.page;
                localStorage.setItem('activePage', page);
                if (page) {
                    this.router.navigate(page);
                }
            });
        });
        // Logout
        document.getElementById('logout').addEventListener('click', (e) => {
            e.preventDefault();
            this.authService.logout();
            this.updateNavigation();
            this.router.navigate('home');
            showMessage('Logged out successfully', 'success');
        });
    }

    updateNavigation() {
        const isAuthenticated = this.authService.isAuthenticated();
        document.querySelectorAll('.auth-required').forEach(el => {
            el.style.display = isAuthenticated ? 'block' : 'none';
        });
        document.querySelectorAll('.guest-only').forEach(el => {
            el.style.display = isAuthenticated ? 'none' : 'block';
        });
    }

    async editMovie(movieId) {

        try {
            const movie = await this.movieService.getMovieById(movieId);
            if (!movie) {
                showMessage('Movie not found');
                return;
            }

            this.router.loadTemplate('add-movie-template');
            const form = document.getElementById('movie-form');

            // Pre-fill form
            form.querySelector('#title').value = movie.title;
            form.querySelector('#description').value = movie.description;
            form.querySelector('#releaseDate').value = movie.releaseDate;
            form.querySelector('#imageUrl').value = movie.imageUrl;

            // Update form title and button
            document.querySelector('.movie-form h1').textContent = 'Edit Movie';
            form.querySelector('button').textContent = 'Update Movie';

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const updatedData = {
                        title: form.querySelector('#title').value,
                        description: form.querySelector('#description').value,
                        releaseDate: form.querySelector('#releaseDate').value,
                        imageUrl: form.querySelector('#imageUrl').value
                    };

                    await this.movieService.updateMovie(movieId, updatedData);
                    showMessage('Movie updated successfully!', 'success');
                    this.router.navigate('movies');
                } catch (error) {

                    showMessage(error.message);
                }
            });
        } catch (error) {
            console.log(error)
            showMessage(error.message);
        }
    }

    async deleteMovie(movieId) {
        if (confirm('Are you sure you want to delete this movie?')) {
            try {
                await this.movieService.deleteMovie(movieId);
                showMessage('Movie deleted successfully!', 'success');
                this.router.navigate('movies');
            } catch (error) {
                showMessage(error.message);
            }
        }
    }
}

// Initialize the application
const app = new App();