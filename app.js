const expressHostString = "http://localhost:3000";
const mongoHostString = "mongodb://localhost:27017/urlShortDB";
const hostPort = "3000";

const express = require( "express" );
const app = express();
app.use( express.urlencoded( { extended: true } ) );
app.use( express.json() );
app.use( express.static( __dirname ) );

const ejs = require( "ejs" );
app.set( "views", __dirname );
app.set( "view engine", "ejs" );


const mongoose = require( "mongoose" );
mongoose.set( "strictQuery", false );
mongoose.connect( mongoHostString )
    .then( ( response ) =>
    {
        console.log( "Connected to MongoDB" );

    } )
    .catch( ( error ) =>
    {
        console.log( `Oh No MongoDB Connection Error: ${ error }` );
    } );

const urlSchema = new mongoose.Schema(
    {
        urlLong: { type: String, required: true },
        urlParam: { type: String, required: true },
        urlShort: { type: String, required: true },
        urlClickCount: { type: Number, default: 0 }

    } );

const Url = mongoose.model( "Url", urlSchema );


const charArray = [ "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0" ];

const randomChar = () =>
{
    return charArray[ Math.floor( Math.random() * charArray.length ) ];
};

const randomString = () => { return `${ randomChar() }${ randomChar() }${ randomChar() }${ randomChar() }`; };

const isValidHttpsURL = ( str ) =>
{
    const regExValidHttpsURL = new RegExp( /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi );
    if ( regExValidHttpsURL.test( str ) )
        return true;
    else
        return false;

};

const completeURL = ( url ) =>
{
    if ( !/^https?:\/\//i.test( url ) )
    {
        url = 'https://' + url;
    }
    return url;
};


app.get( "/", ( req, res ) =>
{
    res.render( "index.ejs" );
} );


app.post( "/", ( req, res ) =>
{
    const urlLong = completeURL( req.body.urlLong );

    if ( isValidHttpsURL( urlLong ) )
    {
        const urlParam = randomString();
        const urlShort = `${ expressHostString }/${ urlParam }`;
        new Url( { urlLong, urlParam, urlShort } ).save()
            .then( ( url ) =>
            {
                console.log( `NEW URL SHORTENING REQUEST PROCESSED. SAVED DOCUMENT IS: ${ url }` );
                res.render( "confirmation.ejs", { url } );

            } );
    } else
    {
        res.send( `${ req.body.urlLong } is not a valid HTTP URL` );

    }
} );




app.get( "/:urlParam", ( req, res ) =>
{

    Url.findOne( { urlParam: req.params.urlParam } )
        .then( ( url ) =>
        {
            console.log( `NEW SHORT URL ACCESS REQUEST HAS COME FOR SHORT URL: ${ url.urlShort }` );
            url.urlClickCount++;
            url.save()
                .then( ( url ) =>
                {
                    res.render( "wait.ejs", { url } );

                } );



        } )
        .catch( ( error ) =>
        {
            const falseURLRequest = `${ expressHostString}/${ req.params.urlParam }`;
            res.status( 404 ).render( "404.ejs", { falseURLRequest } );
        } );



} );









app.listen( hostPort, () =>
{
    console.log( "Listening on port 3000" );
} )


;
