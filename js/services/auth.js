export class AuthService {
    // On n'initialise plus d'état dans le constructeur
    constructor() {}

    // Méthode privée pour récupérer les utilisateurs depuis le localStorage
    _getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }

    // Méthode privée pour sauvegarder les utilisateurs dans le localStorage
    _saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    register(nickname, email, password) {
        return new Promise((resolve, reject) => {
            try {
                const users = this._getUsers();
                if (users.some(user => user.email === email)) {
                    throw new Error('Email already exists');
                }

                const user = {
                    id: Date.now().toString(),
                    nickname,
                    email,
                    password,
                    isLogged: true
                };

                users.push(user);
                this._saveUsers(users);
                localStorage.setItem('currentUser', JSON.stringify(user));

                resolve(user);
            } catch (error) {
                reject(error);
            }
        });
    }

    login(email, password) {
        return new Promise((resolve, reject) => {
            try {
                const users = this._getUsers();
                const user = users.find(u => u.email === email && u.password === password);

                if (!user) {
                    throw new Error('Invalid credentials');
                }

                user.isLogged = true;
                localStorage.setItem('currentUser', JSON.stringify(user));
                this._saveUsers(users);

                resolve(user);
            } catch (error) {
                reject(error);
            }
        });
    }

    logout() {
        const users = this._getUsers();
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (currentUser) {
            const index = users.findIndex(u => u.id === currentUser.id);
            if (index !== -1) {
                users[index].isLogged = false;
            }
            this._saveUsers(users);
        }
        localStorage.removeItem('currentUser');
    }

    isAuthenticated() {
        return !!localStorage.getItem('currentUser');
    }

    static getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    }
}
