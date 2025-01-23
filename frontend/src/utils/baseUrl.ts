// import "dotenv/config";

export default class BaseUrl {
  public static apiBaseUrl = "http://192.168.1.146:3001/";
  public static login = this.apiBaseUrl + "auth/login";
  public static refreshToken = this.apiBaseUrl + "auth/refresh-token";
  public static allocation = this.apiBaseUrl + "allocation";
  public static transaction = this.apiBaseUrl + "transaction";
  public static reminder = this.apiBaseUrl + "reminder";
  public static dashboard = this.apiBaseUrl + "dashboard";
  public static notification = this.apiBaseUrl + "notification";
}