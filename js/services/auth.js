export class AuthService {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }

    register(nickname, email, password) {
        return new Promise((resolve, reject) => {
            try {
                if (this.users.some(user => user.email === email)) {
                    throw new Error('Email already exists');
                }

                const user = {
                    id: Date.now().toString(),
                    nickname,
                    email,
                    password,
                    isLogged: true
                };

                this.users.push(user);
                localStorage.setItem('users', JSON.stringify(this.users));
                this.currentUser = user;
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
                const user = this.users.find(u => u.email === email && u.password === password);

                if (!user) {
                    throw new Error('Invalid credentials');
                }

                user.isLogged = true;
                this.currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
                localStorage.setItem('users', JSON.stringify(this.users));

                resolve(user);
            } catch (error) {
                reject(error);
            }
        });
    }

    logout() {
        if (this.currentUser) {
            const user = this.users.find(u => u.id === this.currentUser.id);
            if (user) {
                user.isLogged = false;
                localStorage.setItem('users', JSON.stringify(this.users));
            }
            this.currentUser = null;
            localStorage.removeItem('currentUser');
        }
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    static getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    }
}