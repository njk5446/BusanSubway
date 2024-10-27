package com.subway.util;

import org.springframework.security.oauth2.core.user.OAuth2User;

public class OAuthUtil {
// OAuth2User 정보를 이용해서 임의의 사용자 아이디를 생성하는 메소드
	public static String getUsernameFromOAuth2User(OAuth2User user) {
		String userString = user.toString();
		String regName = null;
		// userString에 들어있는 값 예시
		// 유저스트링: Name: [115030463058512208559], Granted Authorities: [[OAUTH2_USER, SCOPE_https://www.googleapis.com/auth/userinfo.email, 
		// SCOPE_https://www.googleapis.com/auth/userinfo.profile, SCOPE_openid]], User Attributes: [{sub=115030463058512208559, name=홍길동, given_name=길동, 
		// family_name=홍, picture=https://lh3.googleusercontent.com/a/ACg8ocKn6ke5ULv2Ipbh3cpd478N5gUP4JoVOjfJvrBbun7JMByRjms=s96-c, email=example@gmail.com, email_verified=true}]
		
		// userString의 Name의 문자열 표현을 보고 google, naver, kakao 어떤 제공자의 인증인지 구별하도록 구조화되어있음
		if (userString.contains("google"))	regName = "Google";
		else if (userString.contains("naver")) 	regName = "Naver";
		else if (userString.contains("kakao")) 	regName = "Kakao";
		else {
			// Naver의 OAuth2 인증 식별 응답 구조
			if (userString.contains("id=") && userString.contains("resultcode=") && userString.contains("response="))
				regName = "Naver";
			else
				return null;
		}
		
		// 각 OAuth 인증 식별 구조의 regName이 추가되면, OAuth 로그인한 Name을 뽑아내서 name에 저장 
		String name = user.getName();
		
		// 로그인에 실패하거나 없으면 null 반환
		if (name == null) 
			return null;
		
		// 예시: Google_1123124124 이렇게 반환
		// 예시: Naver_1231241242 이렇게 반환
		return regName + "_" + name;
	}
}
