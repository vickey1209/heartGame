const express = require('express');
const router = express.Router();

router.get('/test', async (req: any, res: any) => { 
  res.status(200).send("OK");
});
router.get('/health', async (req: any, res: any) => { 
  res.status(200).send({health:"OK"});
});


const exportObject = {
  router,
};

export = exportObject;
