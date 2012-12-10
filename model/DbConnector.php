﻿<?php

class DbConnector{
    static private $instance = null;
    private $host,$user,$pass,$dbname;    
    
    private function local(){
        $this->host = 'localhost';
        $this->user = 'root';
        $this->pass = '';
        $this->dbname = 'facebooksecurity';        
    }
    
    private function testServer(){
        $this->host = '192.168.1.251';
        $this->user = 'root';
        $this->pass = '$*TaMaG-IT!';
        $this->dbname = 'facebooksecurity';
    }
    
    public function connect(){
        $this->local();
        #$this->testServer();
        try{
            $db = new mysqli($this->host,$this->user,$this->pass,$this->dbname);
            $db->set_charset('utf8');
        }catch (Exeption $e){
                echo 'Fehler: '.htmlspecialchars($e->getMessage());
        }
        return $db;
    }
    
    
    static public function getInstance(){
        if( null === DbConnector::$instance){
            DbConnector::$instance = new DbConnector();
        }
        return DbConnector::$instance;
    }
    
}

?>
