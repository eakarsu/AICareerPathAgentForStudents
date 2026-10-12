const jwt=require('jsonwebtoken');
const pool=require('../config/database');
require('dotenv').config({path:'../.env'});
async function authenticateToken(req,res,next){
  const token=String(req.headers.authorization||'').match(/^Bearer\s+(\S+)$/i)?.[1];
  if(!token)return res.status(401).json({error:'Access token required'});
  try{
    const claims=jwt.verify(token,process.env.JWT_SECRET);
    if(!Number.isSafeInteger(Number(claims.id))||Number(claims.id)<=0)return res.status(401).json({error:'Invalid session identity'});
    const actor=(await pool.query('SELECT id,email,name FROM users WHERE id=$1',[claims.id])).rows[0];
    if(!actor||actor.email!==claims.email)return res.status(401).json({error:'Your account has changed. Sign in again.'});
    req.user=actor;next();
  }catch(error){res.status(error.name==='JsonWebTokenError'||error.name==='TokenExpiredError'?401:503).json({error:error.name==='JsonWebTokenError'||error.name==='TokenExpiredError'?'Invalid or expired session':'Your account could not be loaded. Retry.'});}
}
function generateToken(user){return jwt.sign({id:user.id,email:user.email,name:user.name},process.env.JWT_SECRET,{expiresIn:'24h'});}
module.exports={authenticateToken,generateToken};
