const request = require('supertest');
const mongoose = require('mongoose');
const { sampleSubmissions } = require('./sample_db');
const server = require('../server');
const SubmissionModel = require('./Submission');

jest.setTimeout(30000);

describe('server', ()=>{
    let app;
    let serverInstance;
    let mockEntries;
    let insertedItems;

    beforeAll( async () => {
        // await mongoose.connect(global.__MONGO_URI__, { useNewUrlParser: true });
        // await mongoose.connection.once('open', function () {
        //     console.log("Test DB is connected");
        // });
        mockEntries = sampleSubmissions;
        app = request( await server() );
    });

    afterAll(async () => {
        mongoose.connection.close();
    });

    describe('POST /register', () => {
        beforeEach( async ()=>{
            await SubmissionModel.insertMany(mockEntries, { ordered: false });          
            insertedItems = await SubmissionModel.find();    
        });
        afterEach( async ()=>{
            await SubmissionModel.deleteMany({})
            .then(x=>x).catch(err=>console.log(err))
        });
        it('should create a new entry', async () => {
            const response = await app.post('/register').send(
                {
                    "email" : "jane@gmail.com",
                    "password" : "1111",
                    "firstName" : "Jane",
                    "lastName" : "Jo",
                    "dob" : "030303",
                    "gender" : "female",
                    "marriageStatus" : "single",
                    "occupation" : "student",
                    "residence" : "Villa",
                    "city" : "Abuja",
                    "homeAddress" : "101, Somewhere St.",
                    "postCode" : "231004",
                }
            ); 
            expect(response.status).toEqual(200);
        });

        it('should NOT create a new entry if the email exists', async () => {
            const response = await app.post('/register').send(
                {
                    "email" : "mary2@gmail.com",
                    "password" : "1111",
                    "firstName" : "Mary",
                    "lastName" : "Jo",
                    "dob" : "030303",
                    "gender" : "female",
                    "marriageStatus" : "single",
                    "occupation" : "student",
                    "residence" : "Villa",
                    "city" : "Abuja",
                    "homeAddress" : "101, Somewhere St.",
                    "postCode" : "231004",
                }
            ).then(x=>x)
            .catch(err => console.log('err', err))

            expect(response.status).toEqual(400);
        });

        
        it('should respond with 4xx if submission is not correct', async ()=> {
            const response = await app.post('/register').send(
                {
                    "email" : null,
                    "password" : "1111",
                    "firstName" : "Mary",
                    "lastName" : "Jo",
                    "dob" : "030303",
                    "gender" : "female",
                    "marriageStatus" : "single",
                    "occupation" : "student",
                    "residence" : "Villa",
                    "city" : "Abuja",
                    "homeAddress" : "101, Somewhere St.",
                    "postCode" : "231004",
                }
            ).then(x=>x)
            .catch(err => err)//console.log('err', err))

            expect(response.status).toEqual(400);
        });
    });  

    describe('POST /login', ()=> {
        beforeEach( async ()=>{
            await SubmissionModel.insertMany(mockEntries, { ordered: false });          
            insertedItems = await SubmissionModel.find();    
        });

        afterEach( async ()=>{
            await SubmissionModel.deleteMany({})
            .then(x=>x).catch(err=>console.log(err))
        });
        
        it('should respond with an access token if credentials are correct', async ()=>{
            const response = await app.post('/login').send({
                "email" : "mary2@gmail.com",
                "password" : "1111",
            }).then(x=>x)
            .catch(err => console.log('err', err));

            expect(response.body.token).toBeTruthy();
            expect(response.body.firstName).toBeTruthy();
            expect(response.body.lastName).toBeTruthy();
            expect(response.status).toEqual(200);
        });

        it('should respond with 4xx if credentials are incorrect', async ()=>{
            const response = await app.post('/login').send({
                "email" : "@gmail.com",
                "password" : "1111",
            }).then(x=>x)
            .catch(err => console.log('err', err));

            //expect(response.body.msg).toBeTruthy();
            expect(response.status).toEqual(400);
        });
    })
});
