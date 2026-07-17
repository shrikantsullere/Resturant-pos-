export const processNativeWalletPayment = async (amount, methodLabel) => {
  if (!window.PaymentRequest) {
    throw new Error('Your browser or device does not support native wallet payments. Please try another method like QR Code or Card.');
  }

  const supportedInstruments = [];

  const isApplePay = methodLabel.toLowerCase().includes('apple');
  const isGooglePay = methodLabel.toLowerCase().includes('google');

  if (isApplePay) {
    supportedInstruments.push({
      supportedMethods: 'https://apple.com/apple-pay',
      data: {
        version: 3,
        merchantIdentifier: 'merchant.com.gilahouse',
        merchantCapabilities: ['supports3DS'],
        supportedNetworks: ['visa', 'masterCard', 'amex'],
        countryCode: 'ID',
      },
    });
  } else if (isGooglePay) {
    supportedInstruments.push({
      supportedMethods: 'https://google.com/pay',
      data: {
        environment: 'TEST', // Set to PRODUCTION when live
        apiVersion: 2,
        apiVersionMinor: 0,
        merchantInfo: {
          merchantName: 'Gila House POS',
        },
        allowedPaymentMethods: [
          {
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA'],
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: {
                gateway: 'example', // e.g., 'stripe' or 'xendit'
                gatewayMerchantId: 'exampleGatewayMerchantId',
              },
            },
          },
        ],
      },
    });
  }

  // Fallback to standard web payment API for generic mobile wallets if needed
  if (supportedInstruments.length === 0) {
    throw new Error('Invalid wallet method selected.');
  }

  const details = {
    total: {
      label: 'Gila House Order',
      amount: {
        currency: 'IDR',
        value: amount.toString(),
      },
    },
  };

  try {
    const request = new PaymentRequest(supportedInstruments, details, { requestPayerName: false });
    
    // Check if the device is actually capable of paying (cards added)
    const canMakePayment = await request.canMakePayment();
    if (!canMakePayment) {
      throw new Error(`${methodLabel} is not configured or ready on your device. Please select another method or set it up in your device settings.`);
    }

    // Trigger the native bottom sheet (biometrics/PIN)
    const response = await request.show();
    
    // Simulate brief processing for the gateway
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await response.complete('success');
    return { success: true, paymentToken: response.details };
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Payment cancelled. You closed the ${methodLabel} popup.`);
    }
    if (err.name === 'SecurityError') {
      throw new Error('Native payments require a secure HTTPS connection. Please use a secure network.');
    }
    throw new Error(err.message || 'Payment failed due to an unknown issue.');
  }
};
