const { expect } = require('chai');
const util = require('util');
const fs = require('fs');
const db2a = require('../lib/db2a');

const {
  BLOB, BINARY, IN, dbstmt, dbconn,
} = db2a;

// Helper: run a DDL/DML statement on a fresh statement handle so errors
// surface immediately. Used by the binary bindParameters regression
// tests when creating their scratch tables.
function runDDL(dbConn, sql) {
  const s = new dbstmt(dbConn);
  try {
    s.execSync(sql);
  } finally {
    s.close();
  }
}

describe('Data Type Test', () => {
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

  describe('select number types', () => {
    it('smallint', (done) => {
      const sql = 'select * from (values smallint( -32768 )) as x (smallint_val)';
      dbStmt.exec(sql, (result, error) => {
        expect(error).to.be.null;
        expect(result).to.be.an('array');
        expect(result.length).to.be.greaterThan(0);
        expect(Object.values(result[0])[0]).to.equal('-32768');
        done();
      });
    });


    it('int', (done) => {
      const sql = 'select * from (values int( -2147483648 )) as x (int_val)';
      dbStmt.exec(sql, (result, error) => {
        expect(error).to.be.null;
        expect(result).to.be.an('array');
        expect(result.length).to.be.greaterThan(0);
        expect(Object.values(result[0])[0]).to.equal('-2147483648');
        done();
      });
    });


    it('bigint', (done) => {
      const sql = 'select * from (values bigint( -9223372036854775808 )) as x (bigint_val)';
      dbStmt.exec(sql, (result, error) => {
        expect(error).to.be.null;
        expect(result).to.be.an('array');
        expect(result.length).to.be.greaterThan(0);
        expect(Object.values(result[0])[0]).to.equal('-9223372036854775808');
        done();
      });
    });


    // it('real', (done) => {
    //   let sql = 'select * from (values real( -12345.54321 )) as x (real_val)',
    //     dbConn = new dbconn();

    //   dbConn.conn('*LOCAL');

    //   let dbStmt = new dbstmt(dbConn);

    //   dbStmt.exec(sql, (result, error) => {
    //     expect(error).to.be.null;
    //     expect(result).to.be.an('array');
    //     expect(result.length).to.be.greaterThan(0);
    //     expect(Object.values(result[0])[0] ).to.equal("-12345.54321");
    //     done();
    //   });
    // });
  });


  // describe('bind parameters blob/binary/varbinary', () => {
  //   it('create tables for test', (done) => {
  //     const user = (process.env.USER).toUpperCase();
  //     const sql = [
  //       `CREATE SCHEMA IF NOT EXISTS ${user}`,
  //       `CREATE OR REPLACE TABLE ${user}.BLOBTEST(BLOB_COLUMN BLOB(512k))`,
  //       `CREATE OR REPLACE TABLE ${user}.BINARYTEST(BINARY_COLUMN BINARY(5000))`,
  //       `CREATE OR REPLACE TABLE ${user}.VARBINTEST(VARBINARY_COLUMN VARBINARY(5000))`
  //     ];
  //     for (let i = 0; i < sql.length; i++) {
  //       dbStmt.execSync(sql[i], (result, err) => { });
  //       dbStmt.closeCursor();
  //     }
  //     done();
  //   });

  //   it('runs SQLExecute and to bind blob', (done) => {
  //     const user = (process.env.USER).toUpperCase();
  //     // Table which only contains one BLOB(512k) Field
  //     const sql = `INSERT INTO ${user}.BLOBTEST(BLOB_COLUMN) VALUES(?)`;
  //     fs.readFile(`${__dirname}/../README.md`, (error, buffer) => {
  //       if (error) {
  //         throw error;
  //       }
  //       dbStmt.prepare(sql, (error) => {
  //         if (error) {
  //           throw error;
  //         }
  //         dbStmt.bindParam([[buffer, IN, BLOB]], (error) => {
  //           if (error) {
  //             throw error;
  //           }
  //           dbStmt.execute((result, error) => {
  //             if (error) {
  //               console.log(util.inspect(error));
  //               throw error;
  //             }
  //             expect(error).to.be.null;
  //             done();
  //           });
  //         });
  //       });
  //     });
  //   });


  //   it('runs SQLExecute and to bind blob (1-D array)', (done) => {
  //     const user = (process.env.USER).toUpperCase();
  //     // Table which only contains one BLOB(512k) Field
  //     const sql = `INSERT INTO ${user}.BLOBTEST(BLOB_COLUMN) VALUES(?)`;
  //     fs.readFile(`${__dirname}/../README.md`, (error, buffer) => {
  //       if (error) {
  //         throw error;
  //       }
  //       dbStmt.prepare(sql, (error) => {
  //         if (error) {
  //           throw error;
  //         }
  //         dbStmt.bindParam([buffer], (error) => {
  //           if (error) {
  //             throw error;
  //           }
  //           dbStmt.execute((result, error) => {
  //             if (error) {
  //               console.log(util.inspect(error));
  //               throw error;
  //             }
  //             expect(error).to.be.null;
  //             done();
  //           });
  //         });
  //       });
  //     });
  //   });


  //   it('runs SQLExecute and to bind blob (bindParameters)', (done) => {
  //     const user = (process.env.USER).toUpperCase();
  //     // Table which only contains one BLOB(512k) Field
  //     const sql = `INSERT INTO ${user}.BLOBTEST(BLOB_COLUMN) VALUES(?)`;
  //     fs.readFile(`${__dirname}/../README.md`, (error, buffer) => {
  //       if (error) {
  //         throw error;
  //       }
  //       dbStmt.prepare(sql, (error) => {
  //         if (error) {
  //           throw error;
  //         }
  //         dbStmt.bindParameters([buffer], (error) => {
  //           if (error) {
  //             throw error;
  //           }
  //           dbStmt.execute((result, error) => {
  //             if (error) {
  //               console.log(util.inspect(error));
  //               throw error;
  //             }
  //             expect(error).to.be.null;
  //             done();
  //           });
  //         });
  //       });
  //     });
  //   });


  //   it('runs SQLExecute and to bind binary', (done) => {
  //     const user = (process.env.USER).toUpperCase();
  //     // Table which only contains one BLOB(10) Field
  //     const sql = `INSERT INTO ${user}.BINARYTEST(BINARY_COLUMN) VALUES(?)`;
  //     fs.readFile(`${__dirname}/../README.md`, (error, buffer) => {
  //       if (error) {
  //         throw error;
  //       }
  //       dbStmt.prepare(sql, (error) => {
  //         if (error) {
  //           throw error;
  //         }
  //         dbStmt.bindParam([[buffer, IN, BINARY]], (error) => {
  //           if (error) {
  //             throw error;
  //           }
  //           dbStmt.execute((result, error) => {
  //             if (error) {
  //               throw error;
  //             }
  //             expect(error).to.be.null;
  //             done();
  //           });
  //         });
  //       });
  //     });
  //   });


  //   it('runs SQLExecute and to bind binary (1-D array)', (done) => {
  //     const user = (process.env.USER).toUpperCase();
  //     // Table which only contains one BLOB(10) Field
  //     const sql = `INSERT INTO ${user}.BINARYTEST(BINARY_COLUMN) VALUES(?)`;
  //     fs.readFile(`${__dirname}/../README.md`, (error, buffer) => {
  //       if (error) {
  //         throw error;
  //       }
  //       dbStmt.prepare(sql, (error) => {
  //         if (error) {
  //           throw error;
  //         }
  //         dbStmt.bindParam([buffer], (error) => {
  //           if (error) {
  //             throw error;
  //           }
  //           dbStmt.execute((result, error) => {
  //             if (error) {
  //               throw error;
  //             }
  //             expect(error).to.be.null;
  //             done();
  //           });
  //         });
  //       });
  //     });
  //   });


  //   it('runs SQLExecute and to bind binary (bindParameters)', (done) => {
  //     const user = (process.env.USER).toUpperCase();
  //     // Table which only contains one BLOB(10) Field
  //     const sql = `INSERT INTO ${user}.BINARYTEST(BINARY_COLUMN) VALUES(?)`;
  //     fs.readFile(`${__dirname}/../README.md`, (error, buffer) => {
  //       if (error) {
  //         throw error;
  //       }
  //       dbStmt.prepare(sql, (error) => {
  //         if (error) {
  //           throw error;
  //         }
  //         dbStmt.bindParameters([buffer], (error) => {
  //           if (error) {
  //             throw error;
  //           }
  //           dbStmt.execute((result, error) => {
  //             if (error) {
  //               throw error;
  //             }
  //             expect(error).to.be.null;
  //             done();
  //           });
  //         });
  //       });
  //     });
  //   });


  //   it('runs SQLExecute and to bind varbinary', (done) => {
  //     const user = (process.env.USER).toUpperCase();
  //     // Table which only contains one VARBINARY(10) Field
  //     const sql = `INSERT INTO ${user}.VARBINTEST(VARBINARY_COLUMN) VALUES(?)`;
  //     fs.readFile(`${__dirname}/../README.md`, (error, buffer) => {
  //       if (error) {
  //         throw error;
  //       }
  //       dbStmt.prepare(sql, (error) => {
  //         if (error) {
  //           throw error;
  //         }
  //         dbStmt.bindParam([[buffer, IN, BLOB]], (error) => {
  //           if (error) {
  //             throw error;
  //           }
  //           dbStmt.execute((result, error) => {
  //             if (error) {
  //               console.log(util.inspect(error));
  //               throw error;
  //             }
  //             expect(error).to.be.null;
  //             done();
  //           });
  //         });
  //       });
  //     });
  //   });
  // });


  // it('runs SQLExecute and to bind varbinary (1-D array)', (done) => {
  //   const user = (process.env.USER).toUpperCase();
  //   // Table which only contains one VARBINARY(10) Field
  //   const sql = `INSERT INTO ${user}.VARBINTEST(VARBINARY_COLUMN) VALUES(?)`;
  //   fs.readFile(`${__dirname}/../README.md`, (error, buffer) => {
  //     if (error) {
  //       throw error;
  //     }
  //     dbStmt.prepare(sql, (error) => {
  //       if (error) {
  //         throw error;
  //       }
  //       dbStmt.bindParam([buffer], (error) => {
  //         if (error) {
  //           throw error;
  //         }
  //         dbStmt.execute((result, error) => {
  //           if (error) {
  //             console.log(util.inspect(error));
  //             throw error;
  //           }
  //           expect(error).to.be.null;
  //           done();
  //         });
  //       });
  //     });
  //   });
  // });

  // it('runs SQLExecute and to bind varbinary (bindParameters)', (done) => {
  //   const user = (process.env.USER).toUpperCase();
  //   // Table which only contains one VARBINARY(10) Field
  //   const sql = `INSERT INTO ${user}.VARBINTEST(VARBINARY_COLUMN) VALUES(?)`;
  //   fs.readFile(`${__dirname}/../README.md`, (error, buffer) => {
  //     if (error) {
  //       throw error;
  //     }
  //     dbStmt.prepare(sql, (error) => {
  //       if (error) {
  //         throw error;
  //       }
  //       dbStmt.bindParameters([buffer], (error) => {
  //         if (error) {
  //           throw error;
  //         }
  //         dbStmt.execute((result, error) => {
  //           if (error) {
  //             console.log(util.inspect(error));
  //             throw error;
  //           }
  //           expect(error).to.be.null;
  //           done();
  //         });
  //       });
  //     });
  //   });
  // });


  describe('exec read blob test', () => {
    it('performs action of given SQL String', (done) => {
      const sql = 'SELECT CAST(\'test\' AS BLOB(10k)) FROM SYSIBM.SYSDUMMY1';
      dbStmt.exec(sql, (result, error) => {
        if (error) {
          console.log(util.inspect(error));
          throw error;
        }
        expect(error).to.be.null;
        expect(result).to.be.an('array');
        expect(result.length).to.be.greaterThan(0);
        expect(Object.values(result[0])[0]).to.be.instanceOf(Buffer);
        done();
      });
    });
  });


  describe('exec read binary test', () => {
    it('performs action of given SQL String', (done) => {
      const sql = 'SELECT CAST(\'test\' AS BINARY(10)) FROM SYSIBM.SYSDUMMY1';
      dbStmt.exec(sql, (result, error) => {
        if (error) {
          console.log(util.inspect(error));
          throw error;
        }
        expect(error).to.be.null;
        expect(result).to.be.an('array');
        expect(result.length).to.be.greaterThan(0);
        expect(Object.values(result[0])[0]).to.be.instanceOf(Buffer);
        done();
      });
    });
  });


  describe('exec read varbinary test', () => {
    it('performs action of given SQL String', (done) => {
      const sql = 'SELECT CAST(\'test\' AS VARBINARY(10)) FROM SYSIBM.SYSDUMMY1';
      dbStmt.exec(sql, (result, error) => {
        if (error) {
          console.log(util.inspect(error));
          throw error;
        }
        expect(error).to.be.null;
        expect(result).to.be.an('array');
        expect(result.length).to.be.greaterThan(0);
        expect(Object.values(result[0])[0]).to.be.instanceOf(Buffer);
        done();
      });
    });
  });

  describe('inconsitent data', () => {
    it('handle ABC/10 error in exec', (done) => {
      const sql = `SELECT 'ABC'/10 AS DIVERR from sysibm.sysdummy1`;
      dbStmt.exec(sql, (result, error) => {
        if (error) {
          console.log(util.inspect(error));
          throw error;
        }
        expect(error).to.be.null;
        expect(result).to.be.an('array');
        expect(result[0].DIVERR).to.equal('-');
        done();
      });
    });

    it('handle ABC/10 error in fetch', (done) => {
      const sql = `SELECT 'ABC'/10 AS DIVERR from sysibm.sysdummy1`;
      dbStmt.prepare(sql, (error) => {
        dbStmt.execute((outParams, error) => {
          dbStmt.fetch((result, error) => {
            expect(error).to.equal(1);
            expect(result).to.be.an('object');
            expect(result.DIVERR).to.equal('-');
            done();
          });
        });
      });
    });

    it('handle ABC/10 error in fetchAll', (done) => {
      const sql = `SELECT 'ABC'/10 AS DIVERR from sysibm.sysdummy1`;
      dbStmt.prepare(sql, (error) => {
        dbStmt.execute((outParams, error) => {
          dbStmt.fetchAll((result, error) => {
            if (error) {
              console.log(util.inspect(error));
              throw error;
            }
            expect(error).to.be.null;
            expect(result).to.be.an('array');
            expect(result[0].DIVERR).to.equal('-');
            done();
          });
        });
      });
    });

    it('handle ABC/10 error in execSync', (done) => {
      const sql = `SELECT 'ABC'/10 AS DIVERR from sysibm.sysdummy1`;
      dbStmt.execSync(sql, (result, error) => {
        if (error) {
          console.log(util.inspect(error));
          throw error;
        }
        expect(error).to.be.null;
        expect(result).to.be.an('array');
        expect(result[0].DIVERR).to.equal('-');
        done();
      });
    });

    it('handle ABC/10 error in fetchSync', (done) => {
      const sql = `SELECT 'ABC'/10 AS DIVERR from sysibm.sysdummy1`;
      const dbConn = new dbconn();
      dbConn.conn('*LOCAL');

      const dbStmt = new dbstmt(dbConn);
      dbStmt.prepareSync(sql, (error) => {
        dbStmt.executeSync((out, error) => {
          dbStmt.fetchSync((result, error) => {
            expect(error).to.equal(1);
            expect(result).to.be.an('object');
            expect(result.DIVERR).to.equal('-');
            done();
          });
        });
      });
    });

    it('handle ABC/10 error in fetchAllSync', (done) => {
      const sql = `SELECT 'ABC'/10 AS DIVERR from sysibm.sysdummy1`;
      dbStmt.prepareSync(sql, (error) => {
        dbStmt.executeSync((outParams, error) => {
          dbStmt.fetchAllSync((result, error) => {
            if (error) {
              console.log(util.inspect(error));
              throw error;
            }
            expect(error).to.be.null;
            expect(result).to.be.an('array');
            expect(result[0].DIVERR).to.equal('-');
            done();
          });
        });
      });
    });
  });

  // Regression tests for BLOB/BINARY/VARBINARY parameter binding.
  //
  // The native bindParams path previously handed CLI a pointer into the
  // caller's V8-owned Buffer for binary types, with ParameterValuePtr
  // bound as INPUT_OUTPUT and no owned output buffer. CLI would write
  // back into the caller's Buffer — overwriting its first bytes at
  // small sizes and overrunning its allocation at ~1 MiB (SIGSEGV).
  //
  // Each test asserts BOTH:
  //   1. the row round-trips correctly (server side), AND
  //   2. the caller's input Buffer is unchanged after the INSERT.
  // Assertion (2) is the load-bearing one — without it, a future
  // change could re-introduce the "bind the V8 pointer directly"
  // shortcut and still pass.
  describe('bind binary parameters (regression: caller Buffer integrity)', () => {
    // Tables live in the current user's default schema, matching the
    // idiom used elsewhere in the suite (see "The stored procedure
    // with result set issue" test in misc.js). CREATE OR REPLACE makes
    // the DDL idempotent across re-runs.
    const user = (process.env.USER).toUpperCase();
    const table = `${user}.BLOBBIND`;
    const varbinTable = `${user}.VARBINBIND`;
    const binTable = `${user}.BINBIND`;
    const multiTable = `${user}.MULTIBIND`;

    before(() => {
      // BLOB(8M) — large enough that the "small Buffer into large
      // column" test (below) exercises the fix's max(paramSize,
      // bufferLength) owned-allocation with meaningful headroom.
      runDDL(dbConn, `CREATE OR REPLACE TABLE ${table} (ID INTEGER NOT NULL, DATA BLOB(8M))`);
      runDDL(dbConn, `CREATE OR REPLACE TABLE ${varbinTable} (ID INTEGER NOT NULL, DATA VARBINARY(4096))`);
      runDDL(dbConn, `CREATE OR REPLACE TABLE ${binTable} (ID INTEGER NOT NULL, DATA BINARY(256))`);
      runDDL(dbConn, `CREATE OR REPLACE TABLE ${multiTable} (ID INTEGER NOT NULL, A BLOB(1M), B BLOB(1M))`);
    });

    // Sizes chosen to exercise the failure modes seen in the repro:
    //   8 B / 1 KiB: caller-Buffer scratch mutation in the first bytes
    //   1 MiB:       CLI write-back overruns the caller's allocation
    const blobSizes = [
      ['8 B', 8],
      ['1 KiB', 1024],
      ['1 MiB', 1024 * 1024],
    ];

    for (const [label, size] of blobSizes) {
      it(`bindParameters round-trips a ${label} BLOB without mutating caller Buffer`, (done) => {
        const id = 1;
        const payload = Buffer.alloc(size, 0xAB);
        const before = Buffer.from(payload); // snapshot for post-bind comparison

        const del = new dbstmt(dbConn);
        del.execSync(`DELETE FROM ${table} WHERE ID = ${id}`);
        del.close();

        const ins = new dbstmt(dbConn);
        ins.prepare(`INSERT INTO ${table} (ID, DATA) VALUES (?, ?)`, (err) => {
          if (err) { ins.close(); return done(err); }
          ins.bindParameters([id, payload], (err) => {
            if (err) { ins.close(); return done(err); }
            ins.execute((_out, err) => {
              ins.close();
              if (err) return done(err);

              // Assertion (2): caller's Buffer must be untouched.
              expect(payload.equals(before), 'caller Buffer mutated by bindParameters').to.be.true;

              // Assertion (1): server-side round-trip matches.
              const sel = new dbstmt(dbConn);
              sel.exec(`SELECT DATA FROM ${table} WHERE ID = ${id}`, (rows, err) => {
                sel.close();
                if (err) return done(err);
                expect(rows).to.be.an('array').with.lengthOf(1);
                const got = rows[0].DATA;
                expect(got).to.be.instanceOf(Buffer);
                expect(got.length).to.equal(size);
                expect(got.equals(before), 'round-tripped BLOB differs from payload').to.be.true;
                done();
              });
            });
          });
        });
      });
    }

    it('bindParametersSync round-trips a 1 KiB BLOB without mutating caller Buffer', () => {
      const id = 2;
      const size = 1024;
      const payload = Buffer.alloc(size, 0xCD);
      const before = Buffer.from(payload);

      const del = new dbstmt(dbConn);
      del.execSync(`DELETE FROM ${table} WHERE ID = ${id}`);
      del.close();

      const ins = new dbstmt(dbConn);
      try {
        ins.prepareSync(`INSERT INTO ${table} (ID, DATA) VALUES (?, ?)`);
        ins.bindParametersSync([id, payload]);
        ins.executeSync();
      } finally {
        ins.close();
      }

      expect(payload.equals(before), 'caller Buffer mutated by bindParametersSync').to.be.true;

      const sel = new dbstmt(dbConn);
      let rows;
      try {
        rows = sel.execSync(`SELECT DATA FROM ${table} WHERE ID = ${id}`);
      } finally {
        sel.close();
      }
      expect(rows).to.be.an('array').with.lengthOf(1);
      const got = rows[0].DATA;
      expect(got).to.be.instanceOf(Buffer);
      expect(got.length).to.equal(size);
      expect(got.equals(before)).to.be.true;
    });

    it('bindParam (2-D, legacy) round-trips a 1 KiB BLOB without mutating caller Buffer', (done) => {
      const id = 3;
      const size = 1024;
      const payload = Buffer.alloc(size, 0xEF);
      const before = Buffer.from(payload);

      const del = new dbstmt(dbConn);
      del.execSync(`DELETE FROM ${table} WHERE ID = ${id}`);
      del.close();

      const ins = new dbstmt(dbConn);
      ins.prepare(`INSERT INTO ${table} (ID, DATA) VALUES (?, ?)`, (err) => {
        if (err) { ins.close(); return done(err); }
        ins.bindParam([[id, IN, 2 /* Integer */], [payload, IN, BLOB]], (err) => {
          if (err) { ins.close(); return done(err); }
          ins.execute((_out, err) => {
            ins.close();
            if (err) return done(err);

            expect(payload.equals(before), 'caller Buffer mutated by bindParam').to.be.true;

            const sel = new dbstmt(dbConn);
            sel.exec(`SELECT DATA FROM ${table} WHERE ID = ${id}`, (rows, err) => {
              sel.close();
              if (err) return done(err);
              expect(rows).to.be.an('array').with.lengthOf(1);
              const got = rows[0].DATA;
              expect(got).to.be.instanceOf(Buffer);
              expect(got.length).to.equal(size);
              expect(got.equals(before)).to.be.true;
              done();
            });
          });
        });
      });
    });

    it('bindParameters round-trips a VARBINARY without mutating caller Buffer', (done) => {
      const id = 4;
      const size = 256;
      const payload = Buffer.alloc(size, 0x5A);
      const before = Buffer.from(payload);

      const del = new dbstmt(dbConn);
      del.execSync(`DELETE FROM ${varbinTable} WHERE ID = ${id}`);
      del.close();

      const ins = new dbstmt(dbConn);
      ins.prepare(`INSERT INTO ${varbinTable} (ID, DATA) VALUES (?, ?)`, (err) => {
        if (err) { ins.close(); return done(err); }
        ins.bindParameters([id, payload], (err) => {
          if (err) { ins.close(); return done(err); }
          ins.execute((_out, err) => {
            ins.close();
            if (err) return done(err);

            expect(payload.equals(before), 'caller Buffer mutated by bindParameters').to.be.true;

            const sel = new dbstmt(dbConn);
            sel.exec(`SELECT DATA FROM ${varbinTable} WHERE ID = ${id}`, (rows, err) => {
              sel.close();
              if (err) return done(err);
              expect(rows).to.be.an('array').with.lengthOf(1);
              const got = rows[0].DATA;
              expect(got).to.be.instanceOf(Buffer);
              expect(got.length).to.equal(size);
              expect(got.equals(before)).to.be.true;
              done();
            });
          });
        });
      });
    });

    // Fixed-width BINARY(n) column — distinct paramType from BLOB and
    // VARBINARY. The input is shorter than the column width, so Db2
    // right-pads with zero bytes server-side; the round-trip check
    // compares against the padded expectation.
    it('bindParameters round-trips a BINARY column without mutating caller Buffer', (done) => {
      const id = 5;
      const inputSize = 64;
      const columnSize = 256;
      const payload = Buffer.alloc(inputSize, 0x77);
      const before = Buffer.from(payload);
      const expected = Buffer.concat([before, Buffer.alloc(columnSize - inputSize, 0x00)]);

      const del = new dbstmt(dbConn);
      del.execSync(`DELETE FROM ${binTable} WHERE ID = ${id}`);
      del.close();

      const ins = new dbstmt(dbConn);
      ins.prepare(`INSERT INTO ${binTable} (ID, DATA) VALUES (?, ?)`, (err) => {
        if (err) { ins.close(); return done(err); }
        ins.bindParameters([id, payload], (err) => {
          if (err) { ins.close(); return done(err); }
          ins.execute((_out, err) => {
            ins.close();
            if (err) return done(err);

            expect(payload.equals(before), 'caller Buffer mutated by bindParameters').to.be.true;

            const sel = new dbstmt(dbConn);
            sel.exec(`SELECT DATA FROM ${binTable} WHERE ID = ${id}`, (rows, err) => {
              sel.close();
              if (err) return done(err);
              expect(rows).to.be.an('array').with.lengthOf(1);
              const got = rows[0].DATA;
              expect(got).to.be.instanceOf(Buffer);
              expect(got.length).to.equal(columnSize);
              expect(got.equals(expected), 'BINARY column not zero-padded as expected').to.be.true;
              done();
            });
          });
        });
      });
    });

    // Small Buffer into a column much larger than the payload —
    // exercises the max(paramSize, bufferLength) allocation in the
    // fix. The caller's 1 KiB Buffer is orders of magnitude smaller
    // than the BLOB(8M) column; without the owned allocation CLI
    // would overrun the caller's memory.
    it('bindParameters handles a small Buffer bound to a much larger BLOB column', (done) => {
      const id = 6;
      const size = 1024;
      const payload = Buffer.alloc(size, 0x3C);
      const before = Buffer.from(payload);

      const del = new dbstmt(dbConn);
      del.execSync(`DELETE FROM ${table} WHERE ID = ${id}`);
      del.close();

      const ins = new dbstmt(dbConn);
      ins.prepare(`INSERT INTO ${table} (ID, DATA) VALUES (?, ?)`, (err) => {
        if (err) { ins.close(); return done(err); }
        ins.bindParameters([id, payload], (err) => {
          if (err) { ins.close(); return done(err); }
          ins.execute((_out, err) => {
            ins.close();
            if (err) return done(err);

            expect(payload.equals(before), 'caller Buffer mutated by bindParameters').to.be.true;

            const sel = new dbstmt(dbConn);
            sel.exec(`SELECT DATA FROM ${table} WHERE ID = ${id}`, (rows, err) => {
              sel.close();
              if (err) return done(err);
              expect(rows).to.be.an('array').with.lengthOf(1);
              const got = rows[0].DATA;
              expect(got).to.be.instanceOf(Buffer);
              expect(got.length).to.equal(size);
              expect(got.equals(before)).to.be.true;
              done();
            });
          });
        });
      });
    });

    // Empty Buffer — locks in the fix's "if (allocLen == 0) allocLen = 1"
    // edge case. Db2 stores a zero-length BLOB (not NULL); the round-
    // trip returns a zero-length Buffer.
    it('bindParameters handles an empty Buffer bound to a BLOB column', (done) => {
      const id = 7;
      const payload = Buffer.alloc(0);
      const before = Buffer.from(payload);

      const del = new dbstmt(dbConn);
      del.execSync(`DELETE FROM ${table} WHERE ID = ${id}`);
      del.close();

      const ins = new dbstmt(dbConn);
      ins.prepare(`INSERT INTO ${table} (ID, DATA) VALUES (?, ?)`, (err) => {
        if (err) { ins.close(); return done(err); }
        ins.bindParameters([id, payload], (err) => {
          if (err) { ins.close(); return done(err); }
          ins.execute((_out, err) => {
            ins.close();
            if (err) return done(err);

            expect(payload.equals(before), 'caller Buffer mutated by bindParameters').to.be.true;

            const sel = new dbstmt(dbConn);
            sel.exec(`SELECT DATA FROM ${table} WHERE ID = ${id}`, (rows, err) => {
              sel.close();
              if (err) return done(err);
              expect(rows).to.be.an('array').with.lengthOf(1);
              const got = rows[0].DATA;
              expect(got).to.be.instanceOf(Buffer);
              expect(got.length).to.equal(0);
              done();
            });
          });
        });
      });
    });

    // NULL binding — passing `null` for a BLOB column should take the
    // null short-circuit (SQL_NULL_DATA) and bypass the binary branch
    // entirely. The column stores NULL; no caller-Buffer integrity to
    // assert, just that the path doesn't break and the NULL round-trips.
    it('bindParameters stores NULL when given null for a BLOB column', (done) => {
      const id = 8;

      const del = new dbstmt(dbConn);
      del.execSync(`DELETE FROM ${table} WHERE ID = ${id}`);
      del.close();

      const ins = new dbstmt(dbConn);
      ins.prepare(`INSERT INTO ${table} (ID, DATA) VALUES (?, ?)`, (err) => {
        if (err) { ins.close(); return done(err); }
        ins.bindParameters([id, null], (err) => {
          if (err) { ins.close(); return done(err); }
          ins.execute((_out, err) => {
            ins.close();
            if (err) return done(err);

            const sel = new dbstmt(dbConn);
            sel.exec(`SELECT DATA FROM ${table} WHERE ID = ${id}`, (rows, err) => {
              sel.close();
              if (err) return done(err);
              expect(rows).to.be.an('array').with.lengthOf(1);
              expect(rows[0].DATA).to.be.null;
              done();
            });
          });
        });
      });
    });

    // Two binary params in one statement — exercises paramCount > 1
    // allocation/free pairing through freeSp(). Both caller Buffers
    // must be untouched and both columns must round-trip.
    it('bindParameters round-trips multiple BLOB parameters in one statement', (done) => {
      const id = 9;
      const payloadA = Buffer.alloc(512, 0xA1);
      const payloadB = Buffer.alloc(2048, 0xB2);
      const beforeA = Buffer.from(payloadA);
      const beforeB = Buffer.from(payloadB);

      const del = new dbstmt(dbConn);
      del.execSync(`DELETE FROM ${multiTable} WHERE ID = ${id}`);
      del.close();

      const ins = new dbstmt(dbConn);
      ins.prepare(`INSERT INTO ${multiTable} (ID, A, B) VALUES (?, ?, ?)`, (err) => {
        if (err) { ins.close(); return done(err); }
        ins.bindParameters([id, payloadA, payloadB], (err) => {
          if (err) { ins.close(); return done(err); }
          ins.execute((_out, err) => {
            ins.close();
            if (err) return done(err);

            expect(payloadA.equals(beforeA), 'caller Buffer A mutated by bindParameters').to.be.true;
            expect(payloadB.equals(beforeB), 'caller Buffer B mutated by bindParameters').to.be.true;

            const sel = new dbstmt(dbConn);
            sel.exec(`SELECT A, B FROM ${multiTable} WHERE ID = ${id}`, (rows, err) => {
              sel.close();
              if (err) return done(err);
              expect(rows).to.be.an('array').with.lengthOf(1);
              expect(rows[0].A).to.be.instanceOf(Buffer);
              expect(rows[0].B).to.be.instanceOf(Buffer);
              expect(rows[0].A.equals(beforeA)).to.be.true;
              expect(rows[0].B.equals(beforeB)).to.be.true;
              done();
            });
          });
        });
      });
    });

    // Rebind on the same statement handle — call bindParameters twice
    // on the same prepared statement without re-preparing. Previously
    // param[i].buf held a V8 pointer, so freeSp()'s free() on rebind
    // was undefined behaviour; now it holds a calloc'd allocation, so
    // the free/re-calloc pairing is exercised and must not double-free
    // or leak. Both round-trips must land correct data server-side and
    // leave both caller Buffers untouched.
    it('bindParameters can rebind on the same prepared statement without re-preparing', (done) => {
      const idA = 10;
      const idB = 11;
      const payloadA = Buffer.alloc(1024, 0xAA);
      const payloadB = Buffer.alloc(2048, 0xBB);
      const beforeA = Buffer.from(payloadA);
      const beforeB = Buffer.from(payloadB);

      const del = new dbstmt(dbConn);
      del.execSync(`DELETE FROM ${table} WHERE ID IN (${idA}, ${idB})`);
      del.close();

      const ins = new dbstmt(dbConn);
      ins.prepare(`INSERT INTO ${table} (ID, DATA) VALUES (?, ?)`, (err) => {
        if (err) { ins.close(); return done(err); }
        ins.bindParameters([idA, payloadA], (err) => {
          if (err) { ins.close(); return done(err); }
          ins.execute((_out, err) => {
            if (err) { ins.close(); return done(err); }
            // Rebind without re-preparing — the part under test.
            ins.bindParameters([idB, payloadB], (err) => {
              if (err) { ins.close(); return done(err); }
              ins.execute((_out, err) => {
                ins.close();
                if (err) return done(err);

                expect(payloadA.equals(beforeA), 'caller Buffer A mutated').to.be.true;
                expect(payloadB.equals(beforeB), 'caller Buffer B mutated').to.be.true;

                const sel = new dbstmt(dbConn);
                sel.exec(`SELECT ID, DATA FROM ${table} WHERE ID IN (${idA}, ${idB}) ORDER BY ID`, (rows, err) => {
                  sel.close();
                  if (err) return done(err);
                  expect(rows).to.be.an('array').with.lengthOf(2);
                  expect(rows[0].DATA.equals(beforeA), 'first bind round-trip corrupted').to.be.true;
                  expect(rows[1].DATA.equals(beforeB), 'second bind round-trip corrupted').to.be.true;
                  done();
                });
              });
            });
          });
        });
      });
    });

  });
});
