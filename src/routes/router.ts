import express from 'express';
import asyncHandler from 'express-async-handler';

import { CreateBankReq } from '../models/banks/dto/banks.dto';
import { requestBodyValidator } from '../utils/validator';
import BanksController from './controllers/banks.controller';

const banks = new BanksController();
const router = express.Router();

// #region
/**
 * @openapi
 * components:
 *   securitySchemes:
 *     sigv4:
 *       type: "apiKey"
 *       name: "Authorization"
 *       in: "header"
 *       x-amazon-apigateway-authtype: "awsSigv4"
 *   parameters:
 *     xAmzDate:
 *       name: X-Amz-Date
 *       in: header
 *       description: "UTC ISO Timestamp, example format: 20210525T043145Z"
 *       required: true
 *       schema:
 *         type: string
 *     host:
 *       name: Host
 *       in: header
 *       description: "Host for AWS Signature v4"
 *       required: true
 *       schema:
 *         type: string
 *     xAmzContentSha256:
 *       name: X-Amz-Content-Sha256
 *       in: header
 *       description: "Payload content in SHA256"
 *       schema:
 *         type: string
 */
// #endregion

router.put(
	'/banks/',
	asyncHandler(async (req, res, next) => requestBodyValidator(CreateBankReq, req, next)),
	asyncHandler(async (req, res) => banks.updateBank(req, res)),
);

export default router;
