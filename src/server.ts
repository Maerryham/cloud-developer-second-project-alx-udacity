import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import fs from 'fs';
import path from 'path';

(async () => {

  // Init the Express application
  const app = express();
  
  // Set the network port
  const port = process.env.PORT || 8082;

  const validateUrl =  (url: string): boolean => {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
  }
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  app.get( "/filteredimage", async ( req, res ) => {
    
    const URL = req.query.image_url
     //    1. validate the image_url query
     if(!URL) {
      return res.status(422).json({
      status: 'error',
      code: '422',
      message: "Invalid Image URL, Image URL can not be empty"
      })
    }
    if(!validateUrl) {
       return res.status(422).json({
       status: 'error',
       code: '422',
       message: "Invalid Image"
     })
    }
      //    2. call filterImageFromURL(image_url) to filter the image
    try{
      const filtered = await filterImageFromURL(URL);
      if (!filtered) {
        res.status(404).json({
          status: 'error',
          code: '404',
          message: 'filtered not found'
        })
      }
        //    3. send the resulting file in the response
        res.sendFile(filtered);
        const directoryPath = path.join(__dirname, '/util/tmp/');
        fs.readdir(directoryPath, function (err, files) {
          //handling error
          if (err) {
              return res.status(500).json({
                status: 'error',
                code: '500',
                message: 'Unable to scan directory: ' + err, directoryPath
              })
          } 
          // listing all files and adding path to each file
          files = files.map( (file) => {
              return directoryPath + file;
          });
          //    4. deletes any files on the server on finish of the response
          deleteLocalFiles(files);
        });
      
    } catch (e) {
      return res.status(500).json({
        status: 'error',
        code: '500',
        message: e
      })
    } 
  });
 
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("WELCOME TO MARIAM LAWAL'S IMAGE FILTER APP FOR CLOUD DEVELOPER PROJECT")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();