export function showMessage(message, type = 'error') {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;

    const app = document.getElementById('app');
    app.insertBefore(messageElement, app.firstChild);

    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}