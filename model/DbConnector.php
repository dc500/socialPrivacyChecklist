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
    
    //enter db information
    //private function live(){}
    
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