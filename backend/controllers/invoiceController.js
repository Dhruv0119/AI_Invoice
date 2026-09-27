import mongoose from "mongoose";
import path from "path";
import Invoice from "../models/invoicemodel.js";
import { getAuth } from "@clerk/express";

const API_BASE = "http://localhost:4000";

function computeTotals(items = [], taxPercent = 0) {
    const safe = Array.isArray(items) ? items.filter(Boolean) : [];
    const subtotal = safe.reduce((sum, item) => {
        const quantity = Number(item.quantity ?? item.qty ?? 0);
        const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
        return sum + quantity * unitPrice;
    }, 0);

    const tax = (subtotal * Number(taxPercent || 0)) / 100;
    const total = subtotal + tax;
    return { subtotal, tax, total };
}

function parseItemsField(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
        try {
            return JSON.parse(val);
        } catch {
            return [];
        }
    }
    return val;
}

function isObjectIdString(val) {
    return typeof val === "string" && /^[0-9a-fA-F]{24}$/.test(val);
}

function uploadedFilesToUrls(req) {
    const urls = {};
    if (!req.files) return urls;

    const mapping = {
        logoName: "logoDataUrl",
        stampName: "stampDataUrl",
        signatureNameMeta: "signatureDataUrl",
        logo: "logoDataUrl",
        stamp: "stampDataUrl",
        signature: "signatureDataUrl",
    };

    Object.keys(mapping).forEach((field) => {
        const arr = req.files[field];
        if (Array.isArray(arr) && arr[0]) {
            const filename = arr[0].filename || (arr[0].path && path.basename(arr[0].path));
            if (filename) urls[mapping[field]] = `${API_BASE}/uploads/${filename}`;
        }
    });

    return urls;
}

async function generateUniqueInvoiceNumber(attempts = 8) {
    for (let i = 0; i < attempts; i++) {
        const ts = Date.now().toString();
        const suffix = Math.floor(Math.random() * 900000).toString().padStart(6, "0");
        const candidate = `INV-${ts.slice(-6)}-${suffix}`;

        const exists = await Invoice.exists({ invoiceNumber: candidate });
        if (!exists) return candidate;
        await new Promise((resolve) => setTimeout(resolve, 2));
    }

    return new mongoose.Types.ObjectId().toString();
}

export {
    computeTotals,
    parseItemsField,
    isObjectIdString,
    uploadedFilesToUrls,
    generateUniqueInvoiceNumber,
};

export default {
    computeTotals,
    parseItemsField,
    isObjectIdString,
    uploadedFilesToUrls,
    generateUniqueInvoiceNumber,
};

export async function createInvoice(req, res) {
    try {
        const { userId } = getAuth(req) || {};
        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        const body = req.body || {};
        const rawItems = Array.isArray(body.items) ? body.items : parseItemsField(body.items);
        const items = rawItems.map((item, index) => ({
            id: item.id || String(index + 1),
            description: item.description || item.desc || "",
            quantity: Number(item.quantity ?? item.qty ?? 1),
            unitPrice: Number(item.unitPrice ?? item.price ?? 0),
        }));
        const taxPercent = Number(body.taxPercent ?? body.tax ?? body.defaultTaxPercent ?? 0);
        const totals = computeTotals(items, taxPercent);
        const fileUrls = uploadedFilesToUrls(req);

        const invoiceNumberProvided =
            typeof body.invoiceNumber === "string" && body.invoiceNumber.trim()
                ? String(body.invoiceNumber).trim()
                : null;

        if (invoiceNumberProvided) {
            const duplicate = await Invoice.exists({ invoiceNumber: invoiceNumberProvided });
            if (duplicate) {
                return res.status(409).json({ success: false, message: "Invoice number already exists" });
            }
        }

        const invoiceNumber = invoiceNumberProvided || (await generateUniqueInvoiceNumber());

        const doc = new Invoice({
            _id: new mongoose.Types.ObjectId(),
            owner: userId,
            invoiceNumber,
            issuedDate: body.issuedDate || body.issueDate || new Date(),
            dueDate: body.dueDate || new Date(),
            fromBusinessName: body.fromBusinessName || "",
            fromEmail: body.fromEmail || "",
            fromAddress: body.fromAddress || "",
            fromPhone: body.fromPhone || "",
            fromGst: body.fromGst || "",
            client:
                typeof body.client === "string" && body.client.trim()
                    ? { name: body.client }
                    : body.client || {},
            items,
            subtotal: totals.subtotal,
            tax: totals.tax,
            total: totals.total,
            currency: body.currency || "INR",
            status: body.status ? String(body.status).toLowerCase() : "draft",
            taxPercent,
            logoDataUrl: fileUrls.logoDataUrl || body.logoDataUrl || body.logo || null,
            stampDataUrl: fileUrls.stampDataUrl || body.stampDataUrl || body.stamp || null,
            signatureDataUrl: fileUrls.signatureDataUrl || body.signatureDataUrl || body.signature || null,
            signatureName: body.signatureName || "",
            signatureTitle: body.signatureTitle || "",
            notes: body.notes || body.aiSource || "",
        });

        let saved = null;
        let attempts = 0;
        const maxSaveAttempts = 6;

        while (attempts < maxSaveAttempts) {
            try {
                saved = await doc.save();
                break;
            } catch (err) {
                if (err && err.code === 11000 && err.keyPattern && err.keyPattern.invoiceNumber) {
                    attempts += 1;
                    doc.invoiceNumber = await generateUniqueInvoiceNumber();
                    continue;
                }
                throw err;
            }
        }

        if (!saved) {
            return res.status(500).json({ success: false, message: "Failed to create invoice after multiple attempts" });
        }

        return res.status(201).json({ success: true, message: "Invoice created", data: saved });
    } catch (err) {
        console.error("createInvoice error:", err);
        if (err && err.type === "entity.too.large") {
            return res.status(413).json({ success: false, message: "Payload too large" });
        }
        if (err && err.code === 11000 && err.keyPattern && err.keyPattern.invoiceNumber) {
            return res.status(409).json({ success: false, message: "Invoice number already exists" });
        }
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function getInvoices(req, res) {
    try {
        const { userId } = getAuth(req) || {};
        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        const query = { owner: userId };
        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.invoiceNumber) {
            query.invoiceNumber = req.query.invoiceNumber;
        }
        if (req.query.search) {
            const search = String(req.query.search).trim();
            query.$or = [
                { fromEmail: { $regex: search, $options: "i" } },
                { "client.email": { $regex: search, $options: "i" } },
                { "client.name": { $regex: search, $options: "i" } },
                { invoiceNumber: { $regex: search, $options: "i" } },
            ];
        }

        const invoices = await Invoice.find(query).sort({ createdAt: -1 }).lean();
        return res.status(200).json({ success: true, data: invoices });
    } catch (error) {
        console.error("getInvoices error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function getInvoiceById(req, res) {
    try {
        const { userId } = getAuth(req) || {};
        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        const { id } = req.params;
        let inv;
        if (isObjectIdString(id)) {
            inv = await Invoice.findById(id);
        } else {
            inv = await Invoice.findOne({ invoiceNumber: id });
        }

        if (!inv) {
            return res.status(404).json({ success: false, message: "Invoice not found" });
        }

        if (inv.owner && String(inv.owner) !== String(userId)) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        return res.status(200).json({ success: true, data: inv });
    } catch (error) {
        console.error("getInvoiceById error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function updateInvoice(req, res) {
    try {
        const { userId } = getAuth(req) || {};
        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        const { id } = req.params;
        const body = req.body || {};
        const existingInvoice = await Invoice.findOne(
            isObjectIdString(id) ? { _id: id, owner: userId } : { owner: userId, invoiceNumber: id }
        );

        if (!existingInvoice) {
            return res.status(404).json({ success: false, message: "Invoice not found" });
        }

        if (body.invoiceNumber && String(body.invoiceNumber).trim() !== existingInvoice.invoiceNumber) {
            const conflict = await Invoice.findOne({ invoiceNumber: String(body.invoiceNumber).trim() });
            if (conflict && String(conflict._id) !== String(existingInvoice._id)) {
                return res.status(409).json({ success: false, message: "Invoice number already exists" });
            }
        }

        const rawItems = Array.isArray(body.items)
            ? body.items
            : typeof body.items === "string" && body.items.length
                ? parseItemsField(body.items)
                : [];
        const items = rawItems.map((item, index) => ({
            id: item.id || String(index + 1),
            description: item.description || item.desc || "",
            quantity: Number(item.quantity ?? item.qty ?? 1),
            unitPrice: Number(item.unitPrice ?? item.price ?? 0),
        }));

        const taxPercent = Number(body.taxPercent ?? body.tax ?? body.defaultTaxPercent ?? existingInvoice.taxPercent ?? 0);
        const totals = computeTotals(items, taxPercent);
        const fileUrls = uploadedFilesToUrls(req);

        const update = {
            invoiceNumber: body.invoiceNumber ? String(body.invoiceNumber).trim() : existingInvoice.invoiceNumber,
            issuedDate: body.issuedDate ?? body.issueDate ?? existingInvoice.issuedDate,
            dueDate: body.dueDate ?? existingInvoice.dueDate,
            fromBusinessName: body.fromBusinessName ?? existingInvoice.fromBusinessName,
            fromEmail: body.fromEmail ?? existingInvoice.fromEmail,
            fromAddress: body.fromAddress ?? existingInvoice.fromAddress,
            fromPhone: body.fromPhone ?? existingInvoice.fromPhone,
            fromGst: body.fromGst ?? existingInvoice.fromGst,
            client:
                typeof body.client === "string" && body.client.trim()
                    ? { name: body.client }
                    : body.client || existingInvoice.client || {},
            items,
            subtotal: totals.subtotal,
            tax: totals.tax,
            total: totals.total,
            currency: body.currency ?? existingInvoice.currency,
            status: body.status ? String(body.status).toLowerCase() : existingInvoice.status,
            taxPercent,
            logoDataUrl: fileUrls.logoDataUrl || body.logoDataUrl || body.logo || existingInvoice.logoDataUrl,
            stampDataUrl: fileUrls.stampDataUrl || body.stampDataUrl || body.stamp || existingInvoice.stampDataUrl,
            signatureDataUrl: fileUrls.signatureDataUrl || body.signatureDataUrl || body.signature || existingInvoice.signatureDataUrl,
            signatureName: body.signatureName ?? existingInvoice.signatureName,
            signatureTitle: body.signatureTitle ?? existingInvoice.signatureTitle,
            notes: body.notes ?? existingInvoice.notes,
        };

        Object.keys(update).forEach((key) => {
            if (update[key] === undefined) delete update[key];
        });

        const updatedInvoice = await Invoice.findOneAndUpdate(
            { _id: existingInvoice._id },
            { $set: update },
            { new: true, runValidators: true }
        );

        if (!updatedInvoice) {
            return res.status(404).json({ success: false, message: "Failed to update invoice" });
        }

        return res.status(200).json({ success: true, message: "Invoice updated", data: updatedInvoice });
    } catch (err) {
        console.error("updateInvoice error:", err);
        if (err && err.code === 11000 && err.keyPattern && err.keyPattern.invoiceNumber) {
            return res.status(409).json({ success: false, message: "Invoice number already exists" });
        }
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function deleteInvoice(req, res) {
    try {
        const { userId } = getAuth(req) || {};
        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        const { id } = req.params;
        const deletedInvoice = await Invoice.findOneAndDelete(
            isObjectIdString(id) ? { _id: id, owner: userId } : { owner: userId, invoiceNumber: id }
        );

        if (!deletedInvoice) {
            return res.status(404).json({ success: false, message: "Invoice not found" });
        }

        return res.status(200).json({ success: true, message: "Invoice deleted" });
    } catch (error) {
        console.error("deleteInvoice error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}