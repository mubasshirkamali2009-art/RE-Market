const baseUrl =process.env.NEXT_PUBLIC_BASE_URL;


export  const getProducts=async (productsId , status='active')=> {

const res = await fetch(` ${baseUrl}/api/products?productsId=${productsId}&status=${status}`);
return res.json()

}