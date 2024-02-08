const { expect } = require('chai');
const db2a = require('../lib/db2a');

const {
    dbconn,
    dbstmt,
    IN, INOUT, OUT,
    CHAR, INT,
} = db2a;

function printJobLog(conn) {
    const stmt = new dbstmt(conn);
    stmt.prepareSync(`CALL QSYS2.QCMDEXC('DSPJOBLOG OUTPUT(*PRINT)')`);
    stmt.executeSync();
    stmt.close();
    return;
}

describe('Procedure Parameter Test', () => {
    let dbConn, dbStmt, params, user;

    before(() => {
        user = (process.env.USER).toUpperCase();
        dbConn = new dbconn();
        dbConn.debug(true);
        dbConn.conn('*LOCAL');
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

    describe('Back to basics procedure with VARCHAR(1) parameter', () => {
        let user = (process.env.USER).toUpperCase();
        let crtSP = `CREATE OR REPLACE PROCEDURE ${user}.SP_TEST_PARAMS(
            IN  P_IN  VARCHAR(2) ,
            OUT P_OUT VARCHAR(2) ,
            OUT P_OUT1 VARCHAR(2) ,
            OUT P_OUT2 VARCHAR(2) ,
            OUT P_OUT3 VARCHAR(2) )

            BEGIN

                DECLARE MSG VARCHAR(200);

                IF P_IN IS NULL THEN
                    CALL SYSTOOLS.LPRINTF('BEFORE - P_IN IS NULL');
                ELSE
                    CALL SYSTOOLS.LPRINTF('BEFORE - P_IN LENGTH=' CONCAT TRIM(CHAR(LENGTH(P_IN))) CONCAT ' VALUE=>' CONCAT P_IN CONCAT '<');
                END IF;
                IF P_OUT IS NULL THEN
                    CALL SYSTOOLS.LPRINTF('BEFORE - P_OUT IS NULL');
                ELSE
                    CALL SYSTOOLS.LPRINTF('BEFORE - P_OUT LENGTH=' CONCAT TRIM(CHAR(LENGTH(P_OUT))) CONCAT ' VALUE=>' CONCAT P_OUT CONCAT '<');
                END IF;

                IF P_IN IS NOT NULL THEN
                    SET P_OUT = UPPER(P_IN);
                END IF;

                IF P_IN IS NULL THEN
                    CALL SYSTOOLS.LPRINTF('AFTER - P_IN IS NULL');
                ELSE
                    CALL SYSTOOLS.LPRINTF('AFTER - P_IN LENGTH=' CONCAT TRIM(CHAR(LENGTH(P_IN))) CONCAT ' VALUE=>' CONCAT P_IN CONCAT '<');
                END IF;
                IF P_OUT IS NULL THEN
                    CALL SYSTOOLS.LPRINTF('AFTER - P_OUT IS NULL');
                ELSE
                    CALL SYSTOOLS.LPRINTF('AFTER - P_OUT LENGTH=' CONCAT TRIM(CHAR(LENGTH(P_OUT))) CONCAT ' VALUE=>' CONCAT P_OUT CONCAT '<');
                END IF;

                -- SET P_OUT1 = '12';
                -- SET P_OUT2 = '34';
                -- SET P_OUT3 = '56';

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

        it(`CHAR(1) #1 single character passed`, (done) => {
            dbStmt = new dbstmt(dbConn);
            dbStmt.prepareSync(`CALL ${user}.SP_TEST_PARAMS(?,?,?,?,?)`);
            const params = [ ['a', IN, CHAR], ['b', OUT, CHAR],
                             [null,OUT,CHAR], [null,OUT,CHAR], [null,OUT,CHAR] ];

            console.log(`Params: ${JSON.stringify(params)}`);
            
            dbStmt.bindParametersSync(params);
            const result = dbStmt.executeSync();

            console.log(`Result: ${JSON.stringify(result)}`);

            expect(result.length).to.equal(1);
            // Passed parameters
            expect(result[0]).to.equal('A');
            done();
        });

        it(`CHAR(1) #1 empty passed`, (done) => {
            dbStmt = new dbstmt(dbConn);
            dbStmt.prepareSync(`CALL ${user}.SP_TEST_PARAMS(?,?,?,?,?)`);
            const params = [ ['',IN, CHAR], ['',OUT,CHAR],
                             [null,OUT,CHAR], [null,OUT,CHAR], [null,OUT,CHAR] ];

            console.log(`Params: ${JSON.stringify(params)}`);
            
            dbStmt.bindParametersSync(params);
            const result = dbStmt.executeSync();

            console.log(`Result: ${JSON.stringify(result)}`);

            expect(result.length).to.equal(1);
            // Passed parameters
            expect(result[0]).to.equal('');
            done();
        });

        it(`CHAR(1) #1 null passed`, (done) => {
            dbStmt = new dbstmt(dbConn);
            dbStmt.prepareSync(`CALL ${user}.SP_TEST_PARAMS(?,?,?,?,?)`);
            const params = [ [null,IN, CHAR], [null,OUT,CHAR],
                             [null,OUT,CHAR], [null,OUT,CHAR], [null,OUT,CHAR] ];

            console.log(`Params: ${JSON.stringify(params)}`);
            
            dbStmt.bindParametersSync(params);
            const result = dbStmt.executeSync();

            console.log(`Result: ${JSON.stringify(result)}`);

            expect(result.length).to.equal(1);
            // Passed parameters
            expect(result[0]).to.equal(null);
            done();
        });
    });
});
