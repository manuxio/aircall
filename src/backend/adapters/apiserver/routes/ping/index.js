import express from 'express';
import {
  JsonReply
} from '../../../../../libs/';
const router = express.Router();

router.use((req, res) => { // run for any & all requests
    const reply = new JsonReply('pong');
    res.json(reply);
});

export default router;