const { Router } = require("express");
const router = Router();
const { firebase } = require("../firebase/firebase");

router.get("/api/getMunicipios", async (request, response) => {
  try {
    const values = await firebase.collection("municipios").get();
    const municipios = values.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    return response.status(200).json(municipios);
  } catch (error) {
    return response.status(500).json(error);
  }
});

module.exports = router;
