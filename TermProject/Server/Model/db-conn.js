"use strict";
const path = require("path");
const Database = require("better-sqlite3");

// Check if database file exists and is accessible
const dbPath = "server/moviestore.db";
console.log("Attempting to connect to database at:", path.resolve(dbPath));

try {
    const db = new Database(dbPath, { verbose: console.log });
    
    // Test database connection
    console.log("Database connected successfully");
    
    // List all tables
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log("Available tables:", tables);
    
    // Test query on CATEGORIES table
    const categories = db.prepare("SELECT * FROM CATEGORIES").all();
    console.log("Categories found:", categories.length);

    function all(sql, params = []) {
        try {
            return db.prepare(sql).all(params);
        } catch (error) {
            console.error("Database error in all():", error);
            throw error;
        }
    }

    function get(sql, params = []) {
        try {
            return db.prepare(sql).get(params);
        } catch (error) {
            console.error("Database error in get():", error);
            throw error;
        }
    }

    function run(sql, params = []) {
        try {
            return db.prepare(sql).run(params);
        } catch (error) {
            console.error("Database error in run():", error);
            throw error;
        }
    }

    function exec(sql) {
        try {
            return db.exec(sql);
        } catch (error) {
            console.error("Database error in exec():", error);
            throw error;
        }
    }

    function db_close() {
        console.log("Closing database connection...");
        db.close();
    }

    module.exports = {
        all,
        get,
        run,
        exec,
        db_close
    };

} catch (error) {
    console.error("Failed to connect to database:", error);
    throw error;
}