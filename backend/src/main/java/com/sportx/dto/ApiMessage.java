package com.sportx.dto;

public class ApiMessage {

    private boolean success;
    private String message;
    private Object data;

    public ApiMessage(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public ApiMessage(boolean success, String message, Object data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public static ApiMessage ok(String message) { return new ApiMessage(true, message); }
    public static ApiMessage ok(String message, Object data) { return new ApiMessage(true, message, data); }

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public Object getData() { return data; }
}
