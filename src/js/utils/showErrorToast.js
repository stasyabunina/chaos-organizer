import errorToast from '../components/error';

let toastTimeout;

export function showErrorToast(error) {
    const toast = document.querySelector('.toast');

    if (toast) {
        clearTimeout(toastTimeout);
        toast.remove();
    }

    document.body.insertAdjacentHTML('beforeend', errorToast(error));

    toastTimeout = setTimeout(() => {
        const newToast = document.querySelector('.toast');
        if (newToast) {
            newToast.remove();
        }
    }, 5500);
}