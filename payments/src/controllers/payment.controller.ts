import { Handler, Request, Response } from "express";
import { MercadoPagoConfig, Payment } from 'mercadopago';
import axios from 'axios'
import { config } from 'dotenv'
import { storePayment } from "../utils/dao/dao.utils";
import path from 'path'
import { ROOT } from "../..";

config()
const PAYPAL_API_SANDBOX = process.env.PAYPAL_API_SANDBOX as string
const PAYPAL_API_CLIENT = process.env.PAYPAL_API_CLIENT as string
const PAYPAL_API_SECRET = process.env.PAYPAL_API_SECRET as string

export const handlePaymentMercadoPago: Handler = async (req: Request, res: Response) => {
  const client = new MercadoPagoConfig({ accessToken: 'TEST-705174130405385-040114-033fc45163e03f22ca7c30adc4b55ce3-258771229', options: { timeout: 5000, idempotencyKey: 'abc' } });
  const payment = new Payment(client);
  const { amount, email } = req.body
  const body = {
    transaction_amount: amount,
    description: 'Test',
    payment_method_id: 'master',
    payer: {
      email: email
    },
  };
  const requestOptions = {
    idempotencyKey: 'abc',
  };
  payment.create({ body, requestOptions }).then(console.log).catch(console.log);

  return res.status(200).json({ message: "Payment Created" })
}

export const handlePaymentPayPal: Handler = async (req: Request, res: Response) => {
  const { amount, hp, appointment_uuid } = req.body
  console.log()
  const capture = {
    intent: "CAPTURE",
    purchase_units: [
      {
        custom_id: appointment_uuid,
        items: [
          {
            name: "Cita Medica",
            description: `Cita medica con el doctor: ${hp}`,
            quantity: "1",
            unit_amount: {
              currency_code: "MXN",
              value: `${amount}`
            }
          }
        ],
        amount: {
          currency_code: "MXN",
          value: `${amount}`,
          breakdown: {
            item_total: {
              currency_code: "MXN",
              value: `${amount}`,
            }
          }
        }
      }
    ],
    payment_source: {
      paypal: {
        experience_context: {
          brand_name: "PREMED MEETING",
          user_action: "PAY_NOW",
          return_url: `${process.env.PROTOCOL}${process.env.FRONTEND_IP}:${process.env.PORT}/v1/payments/capture-order`,
          cancel_url: `${process.env.PROTOCOL}${process.env.FRONTEND_IP}:${process.env.PORT}/v1/payments/cancel-order`,
        }
      }
    }
  }

  const params = new URLSearchParams()
  params.append('grant_type', 'client_credentials')

  try {

    /* const response = await axios.post(`${PAYPAL_API_SANDBOX}/v1/oauth2/token`, {
      auth: {
        username: process.env.PAYPAL_API_CLIENT as string,
        password: process.env.PAYPAL_API_SECRET as string
      }
    }) */
    const response = await axios({
      method: "POST",
      url: `${process.env.PAYPAL_API_SANDBOX}/v1/oauth2/token`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        grant_type: "client_credentials"
      },
      auth: {
        username: process.env.PAYPAL_API_CLIENT as string,
        password: process.env.PAYPAL_API_SECRET as string
      }
    })
    const api_key = `${response.data.token_type} ${response.data.access_token}`
    console.log(api_key)
    const resp = await axios({
      method: "POST",
      url: `${process.env.PAYPAL_API_SANDBOX}/v2/checkout/orders`,
      headers: {
        'Authorization': `${response.data.token_type} ${response.data.access_token}`,
        "Content-Type": 'application/json'
      },
      data: capture
    })
    /* const resp = await axios.post(`${PAYPAL_API_SANDBOX}/v2/checkout/orders`, capture, {
      headers: {
        'Authorization': `${api_key}`,
        'Content-Type': 'application/json'
      }
    }) */
    console.log(resp.data.links)
    return res.status(200).json(resp.data.links[1])
  } catch (error: any) {
    console.log(error.response.data)
    return res.status(500).json(error.response.data)
  }
}


export const handleCapturePayPal: Handler = async (req: Request, res: Response) => {
  const { token } = req.query

  try {
    const response = await axios.post(`${PAYPAL_API_SANDBOX}/v2/checkout/orders/${token}/capture`, {}, {
      auth: {
        username: PAYPAL_API_CLIENT,
        password: PAYPAL_API_SECRET
      }
    })
    console.log(response.data)
    await storePayment(response.data)
  } catch (error: any) {
    console.log(error)
    return res.status(500).json(error.message)
  }
  //return res.status(200).json({ message: "OK" })
  return res.status(200).sendFile(path.join(ROOT, 'src/utils/statics/payment_capture/index.html'))
}


export const handleCancelPaymentPayPal: Handler = async (req: Request, res: Response) => {
  const { token } = req.query
  try{
    const response = await axios.post(`${PAYPAL_API_SANDBOX}/v2/checkout/orders/${token}/capture`, {}, {
      auth: {
        username: PAYPAL_API_CLIENT,
        password: PAYPAL_API_SECRET
      }
    })
    console.log(response.data)
  }catch(error:any){
    console.log(error)
    return res.status(500).json(error.message)
  }
  //return res.status(200).json({ message: "Cancelled" })
  return res.status(200).sendFile(path.join(ROOT, 'src/utils/statics/payment_cancel/index.html'))
}

/**
 * try {
    const payment = req.query;
    console.log(payment);
    if (payment.type === "payment") {
      const data = await mercadopage.payment.findById(payment["data.id"]);
      console.log(data);
    }

    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something goes wrong" });
  }
 */