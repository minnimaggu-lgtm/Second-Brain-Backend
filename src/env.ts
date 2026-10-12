import "dotenv/config";


function required(name: string):string{
    const value = process.env[name];
    if(!value){
        console.log(value);
        console.log(process.env.DATABASE_URL);
        throw new Error(`${name} is not set in .env`);
    } 
    return value;
}

export const env = {
    connectionString: required("DATABASE_URL"),
    secretKey: required("JWT_SECRETKEY")

}