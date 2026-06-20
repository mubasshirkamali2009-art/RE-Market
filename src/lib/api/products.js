const baseUrl =process.env.NEXT_PUBLIC_BASE_URL;


export  const getProducts=async (_id , status='active')=> {

const res = await fetch(` ${baseUrl}/api/products?_id=${_id}&status=${status}`);
return res.json()

}