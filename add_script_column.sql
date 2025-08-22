-- SQL script to add the missing 'script' column to the test table
-- Run this in your MySQL database if the migration hasn't been applied

ALTER TABLE test ADD COLUMN script TEXT NULL AFTER framework;
