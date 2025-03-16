import {showMessage} from "./utils.js";
import {AuthService} from "./services/auth.js";
import {MovieService} from "./services/movie.js";

export class Router {
    authService = new AuthService();
    movieService = new MovieService();
    constructor() {
        this.routes = {
            home: () => this.loadTemplate('home-template'),
            movies: () => this.loadMoviesPage(),
            'add-movie': () => this.loadAddMoviePage(),
            login: () => this.loadLoginPage(),
            register: () => this.loadRegisterPage()
        };
    }

    init() {
        window.addEventListener('popstate', () => this.handleRoute());
        this.handleRoute();
    }

    navigate(route) {
        window.history.pushState(null, '', `#${route}`);
        this.handleRoute();
    }

    handleRoute() {
        const hash = window.location.hash.slice(1) || 'home';
        const route = this.routes[hash];

        if (route) {
            route();
        } else {
            this.navigate('home');
        }
    }

    loadTemplate(templateId) {
        const template = document.getElementById(templateId);
        const content = template.content.cloneNode(true);
        const app = document.getElementById('app');
        app.innerHTML = '';
        app.appendChild(content);
    }

    loadLoginPage() {
        this.loadTemplate('login-template');
        const form = document.getElementById('login-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const email = form.querySelector('#email').value;
                const password = form.querySelector('#password').value;

                await this.authService.login(email, password);

                showMessage('Logged in successfully!', 'success');
                window.app.updateNavigation();
                this.navigate('movies');
            } catch (error) {
                showMessage(error.message);
            }
        });
    }

    loadRegisterPage() {
        this.loadTemplate('register-template');
        const form = document.getElementById('register-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const nickname = form.querySelector('#nickname').value;
                const email = form.querySelector('#email').value;
                const password = form.querySelector('#password').value;

                await this.authService.register(nickname, email, password);

                showMessage('Registered successfully!', 'success');
                window.app.updateNavigation();
                this.navigate('movies');
            } catch (error) {
                showMessage(error.message);
            }
        });
    }

    loadAddMoviePage() {
        this.loadTemplate('add-movie-template');
        const form = document.getElementById('movie-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const movieData = {
                    title: form.querySelector('#title').value,
                    description: form.querySelector('#description').value,
                    releaseDate: form.querySelector('#releaseDate').value,
                    imageUrl: form.querySelector('#imageUrl').value
                };


                await this.movieService.createMovie(movieData);

                showMessage('Movie added successfully!', 'success');
                this.navigate('movies');
            } catch (error) {
                showMessage(error.message);
            }
        });
    }

    async loadMoviesPage() {
        this.loadTemplate('movies-template');
        const movies = await this.movieService.getAllMovies();
        const grid = document.querySelector('.movies-grid');

        if (movies.length === 0) {
            grid.innerHTML = '<p>No movies found.</p>';
            return;
        }

        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.innerHTML = `
                <img src="${movie.imageUrl}" alt="${movie.title}" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                <div class="movie-card-content">
                    <h2>${movie.title}</h2>
                    <p>${new Date(movie.releaseDate).toLocaleDateString()}</p>
                </div>
            `;
            card.addEventListener('click', () => this.showMovieDetails(movie));
            grid.appendChild(card);
        });
    }

    async showMovieDetails(movie) {
        this.loadTemplate('movie-details-template');
        const container = document.querySelector('.movie-details');

        container.querySelector('h1').textContent = movie.title;
        container.querySelector('.movie-image').src = movie.imageUrl;
        container.querySelector('.movie-image').onerror = function() {
            this.src = 'https://via.placeholder.com/300x450?text=No+Image';
        };
        container.querySelector('.release-date').textContent = `Release Date: ${new Date(movie.releaseDate).toLocaleDateString()}`;
        container.querySelector('.description').textContent = movie.description;

        const actions = container.querySelector('.movie-actions');
        const currentUser = AuthService.getCurrentUser();

        if (currentUser && movie.userId === currentUser.id) {
            actions.innerHTML = `
                <button onclick="window.app.editMovie('${movie.id}')">Edit</button>
                <button onclick="window.app.deleteMovie('${movie.id}')">Delete</button>
            `;
        }
    }
}