import mongoose from "mongoose";

const itemschema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    description: {
        type: String,       
        required: true,
    },
    quantity: {
        type: Number,   
        required: true,
        default: 1,
    },
    unitPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    _id: false,
});

const invoiceSchema = new mongoose.Schema({
    owner: {
        type: String,
        required: true,
        index: true,
    },
    invoiceNumber: {
        type: String,
        required: true,
        index: true,
    },
    issuedDate: {
        type: Date,
        required: true,
    },
    dueDate: {
        type: Date,
        default: Date.now,
    },
    fromBusinessName: { type: String, default: "" },
    fromEmail: { type: String, default: "" },
    fromAddress: { type: String, default: "" },
    fromPhone: { type: String, default: "" },
    fromGst: { type: String, default: "" },

    client: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      address: { type: String, default: "" },
      phone: { type: String, default: "" },
    },

    item: {type:[itemschema], default:[]},
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["draft", "unpaid", "paid", "overdue"], default: "draft" },



    logoDataUrl: { type: String, default: null },
    stampDataUrl: { type: String, default: null },
    signatureDataUrl: { type: String, default: null },

    signatureName: { type: String, default: "" },
    signatureTitle: { type: String, default: "" },

    taxPercent: { type: Number, default: 18 },

    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    items: {
        type: [itemschema],
        default: [],
    },
    notes: {
        type: String,
        default: "",
    },
},{
    timestamps: true,
})

const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
export default Invoice;