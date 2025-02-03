import { connection } from "..";
import { Payment } from "@entities/models/";

const paymentRepository = connection.getRepository(Payment);

export { paymentRepository as PaymentRepository };
