import { connection } from "..";
import Transaction from "@entities/models/transacctions";

const transacctionsRepository = connection.getRepository(Transaction);

export { transacctionsRepository as TransacctionsRepository };
