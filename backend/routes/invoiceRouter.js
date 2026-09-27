import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInvoice, getInvoices, getInvoiceById, updateInvoice, deleteInvoice } from '../controllers/invoiceController.js';
import { clerkMiddleware } from '@clerk/express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const invoiceRouter = express.Router();
invoiceRouter.use(clerkMiddleware());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `invoice-${unique}${ext}`);
    },
});

const upload = multer({ storage });

invoiceRouter.get('/', getInvoices);
invoiceRouter.get('/:id', getInvoiceById);

invoiceRouter.post(
    '/',
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'logoName', maxCount: 1 },
        { name: 'stamp', maxCount: 1 },
        { name: 'stampName', maxCount: 1 },
        { name: 'signature', maxCount: 1 },
        { name: 'signatureNameMeta', maxCount: 1 },
    ]),
    createInvoice
);

invoiceRouter.put(
    '/:id',
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'logoName', maxCount: 1 },
        { name: 'stamp', maxCount: 1 },
        { name: 'stampName', maxCount: 1 },
        { name: 'signature', maxCount: 1 },
        { name: 'signatureNameMeta', maxCount: 1 },
    ]),
    updateInvoice
);

invoiceRouter.delete('/:id', deleteInvoice);

export default invoiceRouter;