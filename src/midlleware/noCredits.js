import Swal from "sweetalert2";

// The "can't play" popup. Signed-out sessions get no free credits any more (user/report/index.js):
// the 600 free credits and the monthly top-up are for accounts, so a guest is sent to sign up.
export const noCreditsAlert = (signedIn) => {
    if (signedIn) {
        return Swal.fire({
            icon: 'error',
            title: 'NO CREDITS',
            text: "add more credits",
            showConfirmButton: false,
            timer: 1500
        })
    }
    return Swal.fire({
        icon: 'info',
        title: 'Sign up to watch',
        text: "Create a free UKO account to get 600 free credits, topped back up every month.",
        showConfirmButton: true,
        confirmButtonText: 'Sign up',
        showDenyButton: true,
        denyButtonText: 'Sign in',
        denyButtonColor: '#555',
        showCloseButton: true,
    }).then(({ isConfirmed, isDenied }) => {
        if (isConfirmed) window.location.assign('/signup')
        else if (isDenied) window.location.assign('/signin')
    })
}
