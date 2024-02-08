const { expect } = require('chai');
const db2a = require('../lib/db2a');

const {
    dbconn,
    dbstmt,
    IN, INOUT, OUT,
    CHAR, INT,
} = db2a;

let lastSQL0445Count = 0;

// function createGetJobNameSP(conn, user) {
//     const sql = `CREATE OR REPLACE PROCEDURE ${user}.GET_JOBNAME
//                 ( OUT JOBNAME VARCHAR(28) )
//                 BEGIN
//                     SELECT QSYS2.JOB_NAME INTO JOBNAME FROM SYSIBM.SYSDUMMY1;
//                 END`;
//     const stmt = new dbstmt(conn);
//     stmt.exec(sql)
//     stmt.close();
// }

// function dropGetJobNameSP(conn, user) {
//     const  sql = `DROP PROCEDURE ${user}.GET_JOBNAME`;
//     const stmt = new dbstmt(conn);
//     stmt.exec(sql)
//     stmt.close();
// }

function getJobName(conn) {
    const stmt = new dbstmt(conn);
    stmt.prepareSync(`SELECT QSYS2.JOB_NAME FROM SYSIBM.SYSDUMMY1`);
    stmt.executeSync();
    const result = stmt.fetchAllSync();
    stmt.close();
    const jobName = result[0].JOB_NAME;
    return jobName;
}

function gotSQL0445Message(conn) {
    const stmt = new dbstmt(conn);
    stmt.prepareSync(`SELECT COUNT(*) AS SQL0445_COUNT FROM TABLE(QSYS2.JOBLOG_INFO('*')) WHERE MESSAGE_ID='SQL0445'`);
    stmt.executeSync();
    const result = stmt.fetchAllSync();
    stmt.close();
    const SQL0445Count = result[0].SQL0445_COUNT;
    let hasNewSQL0445Message = false;
    if (SQL0445Count > lastSQL0445Count) {
        hasNewSQL0445Message = true;
        lastSQL0445Count = SQL0445Count;
    }
    return hasNewSQL0445Message;
}

function printJobLog(conn) {
    const stmt = new dbstmt(conn);
    stmt.prepareSync(`CALL QSYS2.QCMDEXC('DSPJOBLOG OUTPUT(*PRINT)')`);
    stmt.executeSync();
    stmt.close();
    return;
}


describe('Procedure Parameter Test', () => {
    let dbConn, dbStmt, params, user, jobname;

    before(() => {
        user = (process.env.USER).toUpperCase();
        dbConn = new dbconn();
        dbConn.debug(true);
        dbConn.conn('*LOCAL');
        jobname = getJobName(dbConn);
    });

    after(() => {
        printJobLog(dbConn);
        dbConn.disconn();
        dbConn.close();
    });

    beforeEach(() => {
        dbStmt = new dbstmt(dbConn);
        params = [];
    });

    afterEach(() => {
        dbStmt.close();
    });

    describe('Stored procedure with VARCHAR(1) parameters', () => {
        let user = (process.env.USER).toUpperCase();
        let sql = `CALL ${user}.SP_TEST_PARAMS(?,?,?,?,?,?,?,?,?)`;
        let crtSP = `CREATE OR REPLACE PROCEDURE ${user}.SP_TEST_PARAMS(
                        -- The passed parameters
                        IN     P_IN          VARCHAR(1) ,
                        INOUT  P_INOUT       VARCHAR(1) ,
                        OUT    P_OUT         VARCHAR(1) ,

                        -- The passed parameter lengths,
                        -- set inside the procedure
                        OUT    P_IN_LEN       INTEGER ,
                        OUT    P_INOUT_LEN    INTEGER ,
                        OUT    P_OUT_LEN      INTEGER ,

                        -- The passed parameter values,
                        -- set inside the procedure
                        OUT    P_IN_INSIDE    VARCHAR(1) ,
                        OUT    P_INOUT_INSIDE VARCHAR(1) ,
                        OUT    P_OUT_INSIDE   VARCHAR(1) )

                        LANGUAGE SQL           
                        
                        BEGIN
                            CALL SYSTOOLS.LPRINTF('P_IN LENGTH=' CONCAT CHAR(LENGTH(P_IN)));
                            CALL SYSTOOLS.LPRINTF('P_IN VALUE=>' CONCAT P_IN CONCAT '<');

                            -- Set the parameter lengths
                            SET P_IN_LEN       = LENGTH(P_IN);
                            SET P_INOUT_LEN    = LENGTH(P_INOUT);
                            SET P_OUT_LEN      = LENGTH(P_OUT);

                            -- Set the parameter values
                            SET P_IN_INSIDE    = P_IN;
                            SET P_INOUT_INSIDE = P_INOUT;
                            SET P_OUT_INSIDE   = P_OUT;
                            -- SET P_OUT_INSIDE   = '';
                            -- CALL SYSTOOLS.LPRINTF('LENGTH=' CONCAT CHAR(LENGTH(P_OUT_INSIDE)));

                            -- Set the passed parameters
                            SET P_IN           = UPPER(P_IN);
                            SET P_INOUT        = UPPER(P_INOUT);
                            SET P_OUT          = UPPER(P_OUT);

                            -- SET P_IN           = 'A';
                            -- SET P_INOUT        = 'B';
                            -- SET P_OUT          = 'C';

                            -- SET P_IN_INSIDE    = 'a';
                            -- SET P_INOUT_INSIDE = 'b';
                            -- SET P_OUT_INSIDE   = 'c';

                        END`;

        let dropSP = `DROP PROCEDURE ${user}.SP_TEST_PARAMS`;

        before((done) => {
            dbStmt = new dbstmt(dbConn);
            dbStmt.exec(crtSP, (result, err) => {
                if (err) throw err;
                dbStmt.close();
                done();
            });
        });

        after((done) => {
            dbStmt = new dbstmt(dbConn);
            dbStmt.exec(dropSP, (result, err) => {
                if (err) throw err;
                dbStmt.close();
                done();
            });

            params = null;
        });

        it(`VARCHAR(1) #1 single character passed`, (done) => {
            dbStmt = new dbstmt(dbConn);
            dbStmt.prepareSync(sql);
            const params = [
                ['a', IN, CHAR], ['b', INOUT, CHAR], ['c', OUT, CHAR],
                [null, OUT, INT], [null, OUT, INT], [null, OUT, INT],
                [null, OUT, CHAR], [null, OUT, CHAR], [null, OUT, CHAR]
            ];

            console.log(`Params: ${JSON.stringify(params)}`);

            dbStmt.bindParametersSync(params);
            const result = dbStmt.executeSync();

            console.log(`Result: ${JSON.stringify(result)}`);

            expect(result.length).to.equal(8);
            // Passed parameters
            expect(result[0]).to.equal('B'); // INOUT param, should change
            expect(result[1]).to.equal(null); // OUT param, should be empty
            // Returned parameter passed 
            // value lengths from inside 
            // procedure
            expect(result[2]).to.equal(1);
            expect(result[3]).to.equal(1);
            expect(result[4]).to.equal(null);
            // Returned parameter passed
            // values from inside procedure
            expect(result[5]).to.equal('a');
            expect(result[6]).to.equal('b');
            expect(result[7]).to.equal(null);
            expect(gotSQL0445Message(dbConn)).to.equal(false);
            done();
        });

        it(`VARCHAR(1) #2 empty character passed`, (done) => {
            dbStmt = new dbstmt(dbConn);
            dbStmt.prepareSync(sql);
            const params = [
                ['', IN, CHAR], ['', INOUT, CHAR], ['', OUT, CHAR],
                [null, OUT, INT], [null, OUT, INT], [null, OUT, INT],
                [null, OUT, CHAR], [null, OUT, CHAR], [null, OUT, CHAR]
            ];

            console.log(`Params: ${JSON.stringify(params)}`);

            dbStmt.bindParametersSync(params);
            const result = dbStmt.executeSync();

            console.log(`Result: ${JSON.stringify(result)}`);

            expect(result.length).to.equal(8);
            // Passed parameters
            expect(result[0]).to.equal(''); // INOUT param, should change
            expect(result[1]).to.equal(null); // OUT param, should be empty
            // Returned parameter passed 
            // value lengths from inside 
            // procedure
            expect(result[2]).to.equal(0);
            expect(result[3]).to.equal(0);
            expect(result[4]).to.equal(null);
            // Returned parameter passed
            // values from inside procedure
            expect(result[5]).to.equal('');
            expect(result[6]).to.equal('');
            expect(result[7]).to.equal(null);
            expect(gotSQL0445Message(dbConn)).to.equal(false);
            done();
        });

        it(`VARCHAR(1) #3 null value passed`, (done) => {
            dbStmt = new dbstmt(dbConn);
            dbStmt.prepareSync(sql);
            const params = [
                [null, IN, CHAR], [null, INOUT, CHAR], [null, OUT, CHAR],
                [null, OUT, INT], [null, OUT, INT], [null, OUT, INT],
                [null, OUT, CHAR], [null, OUT, CHAR], [null, OUT, CHAR]
            ];

            console.log(`Params: ${JSON.stringify(params)}`);

            dbStmt.bindParametersSync(params);
            const result = dbStmt.executeSync();

            console.log(`Result: ${JSON.stringify(result)}`);

            expect(result.length).to.equal(8);
            // Passed parameters
            expect(result[0]).to.equal(null); // INOUT param, should change
            expect(result[1]).to.equal(null); // OUT param, should be empty
            // Returned parameter passed 
            // value lengths from inside 
            // procedure
            expect(result[2]).to.equal(null);
            expect(result[3]).to.equal(null);
            expect(result[4]).to.equal(null);
            // Returned parameter passed
            // values from inside procedure
            expect(result[5]).to.equal(null);
            expect(result[6]).to.equal(null);
            expect(result[7]).to.equal(null);
            expect(gotSQL0445Message(dbConn)).to.equal(false);
            done();
        });

        it(`VARCHAR(1) #4 more characters passed than handled`, (done) => {
            dbStmt = new dbstmt(dbConn);
            dbStmt.prepareSync(sql);
            const params = [
                ['aa', IN, CHAR], ['bb', INOUT, CHAR], ['cc', OUT, CHAR],
                [null, OUT, INT], [null, OUT, INT], [null, OUT, INT],
                [null, OUT, CHAR], [null, OUT, CHAR], [null, OUT, CHAR]
            ];
            dbStmt.bindParametersSync(params);
            const result = dbStmt.executeSync();

            expect(result.length).to.equal(8);
            // Passed parameters
            expect(result[0]).to.equal('B'); // INOUT param, should change
            expect(result[1]).to.equal(null); // OUT param, should be empty
            // Returned parameter passed 
            // value lengths from inside 
            // procedure
            expect(result[2]).to.equal(1);
            expect(result[3]).to.equal(1);
            expect(result[4]).to.equal(null);
            // Returned parameter passed
            // values from inside procedure
            expect(result[5]).to.equal('a');
            expect(result[6]).to.equal('b');
            expect(result[7]).to.equal(null);
            done();
        });

        it(`VARCHAR(1) #5 single space passed`, (done) => {
            dbStmt = new dbstmt(dbConn);
            dbStmt.prepareSync(sql);
            const params = [
                [' ', IN, CHAR], [' ', INOUT, CHAR], [' ', OUT, CHAR],
                [null, OUT, INT], [null, OUT, INT], [null, OUT, INT],
                [null, OUT, CHAR], [null, OUT, CHAR], [null, OUT, CHAR]
            ];
            dbStmt.bindParametersSync(params);
            const result = dbStmt.executeSync();

            expect(result.length).to.equal(8);
            // Passed parameters
            expect(result[0]).to.equal(' '); // INOUT param, should change
            expect(result[1]).to.equal(null); // OUT param, should be empty
            // Returned parameter passed 
            // value lengths from inside 
            // procedure
            expect(result[2]).to.equal(1);
            expect(result[3]).to.equal(1);
            expect(result[4]).to.equal(null);
            // Returned parameter passed
            // values from inside procedure
            expect(result[5]).to.equal(' ');
            expect(result[6]).to.equal(' ');
            expect(result[7]).to.equal(null);
            done();
        });
    });

});
