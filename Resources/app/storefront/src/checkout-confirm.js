import Plugin from 'src/plugin-system/plugin.class';
import AppClient from 'src/service/app-client.service.ts';

const APP_URL = 'https://app-production-b26am5s2cq-ew.a.run.app';

export default class AvataxAddressValidator extends Plugin {
  init() {
    window.addEventListener('DOMContentLoaded', this.onLoad.bind(this));
  }

  addressHandler(response) {
    if (
      response?.payload &&
      Object.keys(response.payload).includes('messages')
    ) {
      const messages = response?.payload?.messages;
      const text = messages.reduce(
        (curr, acc) => curr + acc?.details + ' ',
        ''
      );
      const parent = document.body.querySelector('.checkout-main');
      const firstChild = document.body.querySelector('.confirm-main-header');
      const data =
        document.body.parentElement.querySelector('#avatax_alert').content
          .children;
      const alert = data[0];
      alert.children[1].children[0].innerHTML += text;
      parent.insertBefore(alert, firstChild);
      if (!response?.blockCart) {
        document.body.parentElement.querySelector(
          '#confirmFormSubmit'
        ).disabled = false;
      }
    } else {
      document.body.parentElement.querySelector('#confirmFormSubmit').disabled =
        false;
    }
  }

  errorHandler(error) {
    const parent = document.body.querySelector('.checkout-main');
    const firstChild = document.body.querySelector('.confirm-main-header');
    const data =
      document.body.parentElement.querySelector('#avatax_connection').content
        .children;
    parent.insertBefore(data[0], firstChild);
    if (error?.response && !error.response?.data?.blockCart) {
      document.body.parentElement.querySelector('#confirmFormSubmit').disabled =
        false;
    }
  }

  async onLoad() {
    document.body.parentElement.querySelector('#confirmFormSubmit').disabled =
      true;
    const data = Array.from(
      document.body.parentElement.querySelector('#avatax').content.children
    );
    const address = {
      line1: data.find((x) => x.id === 'avatax_street').innerHTML,
      city: data.find((x) => x.id === 'avatax_city').innerHTML,
      postalCode: data.find((x) => x.id === 'avatax_zipcode').innerHTML,
      country: data.find((x) => x.id === 'avatax_country').innerHTML,
      textCase: 'mixed',
    };
    if (['USA', 'CA'].includes(address.country)) {
      const client = new AppClient('MoptAvalaraCloud');
      client
        .post(APP_URL + '/validate-address', {
          body: JSON.stringify(address),
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          redirect: 'follow',
          referrerPolicy: 'no-referrer',
        })
        .then((response) => response.json())
        .then((data) => this.addressHandler(data))
        .catch((error) => this.errorHandler(error));
    } else {
      document.body.parentElement.querySelector('#confirmFormSubmit').disabled =
        false;
    }
  }
}
