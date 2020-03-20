/*eslint-disable */
import axios from 'axios';
import alert from './alerts';

export const bookTour = async tourId => {
  const stripe = Stripe('pk_test_JU1Do1XdzGW66knXE6Qn6oxR00YMsfdSM4');

  try {
    // Get The Session From The server
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );

    // Create checkout form + charge the credit card
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (error) {
    alert.showAlert('error', error);
  }
};
