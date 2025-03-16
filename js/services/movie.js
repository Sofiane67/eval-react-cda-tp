export class MovieService {
    // Plus besoin d'initialiser this.movies dans le constructeur
    constructor() {}

    // Méthode privée pour récupérer les films directement depuis le localStorage
    _getMovies() {
        return JSON.parse(localStorage.getItem('movies')) || [];
    }

    // Méthode privée pour sauvegarder les films dans le localStorage
    _saveMovies(movies) {
        localStorage.setItem('movies', JSON.stringify(movies));
    }

    getAllMovies() {
        const movies = this._getMovies();
        console.log("ALL MOVIES : ", movies);
        return Promise.resolve(movies);
    }

    getMovieById(id) {
        return new Promise((resolve, reject) => {
            const movies = this._getMovies();
            console.log("MOVIES ALL : ", movies);
            const movie = movies.find(movie => movie.id === id);
            if (movie) {
                resolve(movie);
            } else {
                reject(new Error('Movie not found'));
            }
        });
    }

    createMovie(movieData) {
        return new Promise((resolve, reject) => {
            try {
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (!currentUser) {
                    throw new Error('User must be authenticated');
                }

                const movie = {
                    id: Date.now().toString(),
                    ...movieData,
                    userId: currentUser.id
                };

                const movies = this._getMovies();
                movies.push(movie);
                this._saveMovies(movies);
                resolve(movie);
            } catch (error) {
                reject(error);
            }
        });
    }

    updateMovie(id, movieData) {
        return new Promise((resolve, reject) => {
            try {
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                const movies = this._getMovies();
                console.log("ALL MOVIES EDIT: ", movies);
                const movieIndex = movies.findIndex(movie => movie.id === id);

                console.log("INDEX MOVIE UPDATE : ", movieIndex);

                if (movieIndex === -1) {
                    throw new Error('Movie not found');
                }

                if (movies[movieIndex].userId !== currentUser?.id) {
                    throw new Error('Unauthorized');
                }

                movies[movieIndex] = {
                    ...movies[movieIndex],
                    ...movieData
                };

                this._saveMovies(movies);
                resolve(movies[movieIndex]);
            } catch (error) {
                reject(error);
            }
        });
    }

    deleteMovie(id) {
        return new Promise((resolve, reject) => {
            try {
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                const movies = this._getMovies();
                const movieIndex = movies.findIndex(movie => movie.id === id);

                if (movieIndex === -1) {
                    throw new Error('Movie not found');
                }

                if (movies[movieIndex].userId !== currentUser?.id) {
                    throw new Error('Unauthorized');
                }

                movies.splice(movieIndex, 1);
                this._saveMovies(movies);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
}
