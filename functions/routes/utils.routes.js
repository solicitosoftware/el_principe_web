const { Router } = require("express");
const router = Router();
const { firebase, time, timestamp } = require("../firebase/firebase");

router.put("/api/getTurnoDomicilio/:fecha", async (request, response) => {
  try {
    const values = await firebase
      .collection("pedidos")
      .where("fecha", ">=", timestamp(new Date(request.params.fecha)))
      .orderBy("fecha", "desc")
      .orderBy("turnoDomicilio", "desc")
      .limit(1)
      .get();
    const turno = values.docs.map((doc) => {
      return doc.data().turnoDomicilio;
    });
    return response.status(200).json(...turno);
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.put("/api/getTurnoCaja/:fecha", async (request, response) => {
  try {
    const values = await firebase
      .collection("pedidos")
      .where("fecha", ">=", timestamp(new Date(request.params.fecha)))
      .orderBy("fecha", "desc")
      .orderBy("turno", "desc")
      .limit(1)
      .get();
    const turno = values.docs.map((doc) => {
      return doc.data().turno;
    });
    return response.status(200).json(...turno);
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.post("/api/createTirilla", async (request, response) => {
  try {
    const result = await firebase.collection("informes").add({
      ...request.body.data,
      fecha: timestamp(new Date(request.body.data.fecha)),
    });
    return response.status(200).json(result);
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.put("/api/getTirilla/:fecha", async (request, response) => {
  try {
    const values = await firebase
      .collection("informes")
      .where("fecha", "<=", timestamp(new Date(request.params.fecha)))
      .orderBy("fecha", "desc")
      .limit(1)
      .get();
    const tirilla = values.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    return response.status(200).json(...tirilla);
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.put("/api/updateTirilla/:tirilla_id", async (request, response) => {
  try {
    const document = firebase
      .collection("informes")
      .doc(request.params.tirilla_id);
    await document.update({
      productos: request.body.productos,
    });
    return response.status(200).json();
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.get("/api/getParametros", async (request, response) => {
  try {
    const values = await firebase.collection("parametros").get();
    const parametros = values.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    return response.status(200).json(parametros);
  } catch (error) {
    return response.status(500).json(error);
  }
});

module.exports = router;
