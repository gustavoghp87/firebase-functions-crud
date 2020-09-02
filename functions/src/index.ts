import { Request, Response } from "express";
const app = require('express')();
const path = require('path');

const functions = require('firebase-functions');
const admin = require('firebase-admin');


admin.initializeApp({
    credential: admin.credential.cert(path.join(__dirname, "..", "permissions.json")),
    databaseURL: "https://fir-proy-functions.firebaseio.com"
});
// archivo descargado desde la configuración/settings en firebase 

app.get('/hello-world', (req:Request, res:Response) => {
    return res.status(200).json({message:"Hello World"})
});

const db = admin.firestore();

app.get('/api/products/:product_id', (req:Request, res:Response) => {
    (async () => {
        try {
            const doc = await db.collection('products').doc(req.params.product_id);
            const item = await doc.get();
            const response = item.data();
            return res.status(200).json(response)
        } catch (error) {
            return res.status(500).json(error);
        };
    }) ();
    // http://localhost:5001/firebase-proy-functions/us-central1/app/api/products/1
});

app.get('/api/products', async (req:Request, res:Response) => {
    try {
        const query = db.collection('products');
        const querySnapshot = await query.get();
        const response = querySnapshot.docs.map((doc:any) => ({
        id: doc.id,
        name: doc.data().name
        }));
        return res.status(200).json(response);
    } catch(error) {
        return res.status(500).json();
    };
});

app.post('/api/products', async (req:Request, res:Response) => {
    console.log("llegó algo");
    
    await db.collection('products')
        .doc(`/${req.body.id}/`)
        .create({name:req.body.name});
    return res.status(204).json();
});
// dentro de doc va el id personalizado, nada para generación automática
// 204 todo ok

app.delete('/api/products/:product_id', async (req:Request, res:Response) => {
    try {
        const document = db.collection('products').doc(req.params.product_id);
        await document.delete();
        return res.status(200).json({message:`Eliminado ${req.params.product_id}`});
    } catch (error) {
        return res.status(500).json();
    };
});

app.put('/api/products/:product_id', async (req:Request, res:Response) => {
    try {
        const document = db.collection('products').doc(req.params.product_id);
        await document.update({
            name: req.body.name
        });
        return res.status(200).json({message:`Actualizado ${req.params.product_id}`});
    } catch (error) {
        return res.status(500).json();
    };
});

console.log("ok")

exports.app = functions.https.onRequest(app);



// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
