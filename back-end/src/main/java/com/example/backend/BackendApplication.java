package com.example.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		// Nạp biến môi trường từ file .env (tìm trong thư mục gốc hoặc thư mục back-end)
		Dotenv dotenv = Dotenv.configure()
				.directory("./back-end") // Trỏ thẳng vào thư mục back-end nơi chứa file .env
				.ignoreIfMissing()
				.load();
		
		System.out.println("--- LOG: LOADING ENV VARIABLES FROM .env ---");
		dotenv.entries().forEach(entry -> {
			System.setProperty(entry.getKey(), entry.getValue());
			System.out.println("ENV: " + entry.getKey() + " = " + entry.getValue());
		});
		System.out.println("--- LOG: END LOADING ---");


		SpringApplication.run(BackendApplication.class, args);
	}

}

