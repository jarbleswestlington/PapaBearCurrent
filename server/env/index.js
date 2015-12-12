var env = process.env.NODE_ENV || 'dev';

if(env == "dev"){
	require("./local.env.js");
}