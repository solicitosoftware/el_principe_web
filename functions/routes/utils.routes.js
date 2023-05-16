const { Router } = require("express");
const router = Router();
const { firebase, timestamp } = require("../firebase/firebase");

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

router.get("/api/getConsecutivo", async (request, response) => {
  try {
    const values = await firebase
      .collection("informes")
      .orderBy("consecutivo", "desc")
      .limit(1)
      .get();
    const consecutivo =
      values.docs.length > 0
        ? values.docs.map((doc) => {
            return doc.data().consecutivo + 1;
          })
        : [1];
    return response.status(200).json(consecutivo[0]);
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.put("/api/getTirilla/:fecha", async (request, response) => {
  try {
    const values = await firebase
      .collection("informes")
      .where("fecha", ">=", timestamp(new Date(request.params.fecha)))
      .orderBy("fecha", "asc")
      .limit(1)
      .get();
    const tirilla = values.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    return response.status(200).json(tirilla);
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
