#!/bin/bash

frontend() {
    cd frontend
    npm start
}

backend() {
    cd backend
    make watch
}

main(){
    frontend & backend
}

main
