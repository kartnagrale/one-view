package com.neml.agrianalytix.dto;
import java.util.List;
public record PageDto<T>(List<T> items, long total, int page, int size) {}
