export function validateNativeSession(data,expectedEmail){
 if(typeof data?.token!=='string'||!data?.user?.id||!data.user.email)throw new Error('The server did not return a complete authenticated session.');
 let claims;try{const encoded=data.token.split('.')[1];if(!encoded)throw new Error();claims=JSON.parse(atob(encoded.replace(/-/g,'+').replace(/_/g,'/')));}catch(_){throw new Error('The server returned an invalid session token.');}
 if(Number(claims.id)!==Number(data.user.id)||claims.email!==data.user.email||(expectedEmail&&data.user.email!==expectedEmail)||!Number.isFinite(claims.exp)||claims.exp*1000<=Date.now())throw new Error('The login response did not match the selected account or session.');
 return data;
}
