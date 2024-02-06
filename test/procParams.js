const { expect } = require('chai');
const db2a = require('../lib/db2a');

const {
    SQL_ATTR_CURSOR_TYPE,
    SQL_CURSOR_DYNAMIC,
    SQL_FETCH_RELATIVE,
    SQL_FETCH_NEXT,
    SQL_ERROR,
    SQL_NO_DATA_FOUND,
    dbconn,
    dbstmt,
    IN,
    CHAR,
} = db2a;

describe('Procedure Parameter Test', () => {
    let dbConn, dbStmt;

    before(() => {
        dbConn = new dbconn();
        dbConn.conn('*LOCAL');
    });

    after(() => {
        dbConn.disconn();
        dbConn.close();
    });

    beforeEach(() => {
        dbStmt = new dbstmt(dbConn);
    });

    afterEach(() => {
        dbStmt.close();
    });

    describe('The stored procedure with result set issue', () => {
        let user = (process.env.USER).toUpperCase();
        let sql = `CALL ${user}.SPWITHRS`;
        let crtSP = `CREATE OR REPLACE PROCEDURE ${user}.SP_WITH_CHARS(
                        IN     PARAM1  CHAR(1) ,

                        IN     TESTNUM SMALLINT ,
                        OUT    ERR     CHAR(1) ,
                        OUT    ERRMSG  VARCHAR(50) )

                        LANGUAGE SQL           
                        
                        BEGIN
                            SET ERR = 'N';

                            IF LENGTH(PARAM1) != 1 THEN
                                SET ERR = 'Y';
                                SET ERRMSG = 'PARAM1 length expected to be 1';
                            END IF;
                            IF TESTNUM = 1 AND PARAM1 != 'a' THEN
                                SET ERR = 'Y';
                                SET ERRMSG = 'PARAM1 expected to have a value of ''a''' ;
                            END IF;
                            IF TESTNUM = 2 AND PARAM1 != ' ' THEN
                                SET ERR = 'Y';
                                SET ERRMSG = 'PARAM1 expected to have a value of '' ''' ;
                            END IF;
                            IF TESTNUM = 3 AND PARAM1 != ' ' THEN
                                SET ERR = 'Y';
                                SET ERRMSG = 'PARAM1 expected to have a value of '' ''' ;
                            END IF;
                            SET PARAM1 = 'A';

                        END`;

        let dropSP = `DROP PROCEDURE ${user}.SP_WITH_CHARS`;

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
        });

        it(`CHAR(1) #1 empty string passed`, (done) => {
            dbStmt = new dbstmt(dbConn);
            dbStmt.prepareSync(`CALL ${user}.SP_WITH_CHARS(?,?,?,?)`);
            dbStmt.bindParametersSync(['a',1,'','']);
            const result = dbStmt.executeSync();

            console.log(`Result: ${JSON.stringify(result)}`);

            expect(result.length).to.equal(4);
            expect(result[0]).to.equal('a');
            expect(result[1]).to.equal(1);
            expect(result[2]).to.equal('N');
            expect(result[3]).to.equal('');
            done();
        });

        it(`CHAR(1) #2 single space passed`, (done) => {
            dbStmt = new dbstmt(dbConn);
            dbStmt.prepareSync(`CALL ${user}.SP_WITH_CHARS(?,?,?,?)`);
            dbStmt.bindParametersSync([' ',2,'','']);
            const result = dbStmt.executeSync();

            console.log(`Result: ${JSON.stringify(result)}`);

            expect(result.length).to.equal(4);
            expect(result[0]).to.equal(' ');
            expect(result[1]).to.equal(2);
            expect(result[2]).to.equal('N');
            expect(result[3]).to.equal('');
            done();
        });


        it(`CHAR(1) #3 empty string passed`, (done) => {
            dbStmt = new dbstmt(dbConn);
            dbStmt.prepareSync(`CALL ${user}.SP_WITH_CHARS(?,?,?,?)`);
            dbStmt.bindParametersSync(['',3,'','']);
            const result = dbStmt.executeSync();

            console.log(`Result: ${JSON.stringify(result)}`);

            expect(result.length).to.equal(4);
            expect(result[0]).to.equal(' ');
            expect(result[1]).to.equal(3);
            expect(result[2]).to.equal('N');
            expect(result[3]).to.equal('');
            done();
        });

    });
});
