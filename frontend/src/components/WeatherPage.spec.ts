import { mount } from "@vue/test-utils";
import { reactive } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

import WeatherPage from "@/pages/WeatherPage.vue";
import type { ApiErrorDetails } from "@/types/api";
import type { CurrentWeather, WeatherForecast } from "@/types/weather";

interface WeatherStoreMock {
  cityInput: string;
  currentCity: string;
  currentWeather: CurrentWeather | null;
  forecast: WeatherForecast | null;
  isLoading: boolean;
  error: ApiErrorDetails | null;
  hasWeatherData: boolean;
  searchWeather: ReturnType<typeof vi.fn<() => Promise<void>>>;
  refreshWeather: ReturnType<typeof vi.fn<() => Promise<void>>>;
  clearError: ReturnType<typeof vi.fn<() => void>>;
}

const mockedStore = vi.hoisted(() => ({
  value: null as WeatherStoreMock | null,
}));

vi.mock("@/stores/weather", () => ({
  useWeatherStore: () => mockedStore.value,
}));

function createStore(overrides: Partial<WeatherStoreMock> = {}): WeatherStoreMock {
  return reactive({
    cityInput: "Bengaluru",
    currentCity: "",
    currentWeather: null,
    forecast: null,
    isLoading: false,
    error: null,
    hasWeatherData: false,
    searchWeather: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    refreshWeather: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    clearError: vi.fn<() => void>(),
    ...overrides,
  }) as WeatherStoreMock;
}

function mountWeatherPage() {
  return mount(WeatherPage, {
    global: {
      stubs: {
        Icon: true,
        TemperatureDisplay: {
          props: {
            temperature: {
              type: Number,
              required: true,
            },
          },
          template: '<div aria-live="polite">{{ temperature }}°C</div>',
        },
        WeatherBackground: true,
      },
    },
  });
}

const currentWeather: CurrentWeather = {
  city: "Bengaluru",
  country: "IN",
  temperatureC: 29,
  condition: "Partly Cloudy",
  humidityPercent: 62,
  windKmph: 10,
  updatedAtIso: "2026-02-03T10:30:00+05:30",
};

const forecast: WeatherForecast = {
  city: "Bengaluru",
  country: "IN",
  days: [
    {
      dateIso: "2026-02-03",
      minTempC: 21,
      maxTempC: 28,
      condition: "Cloudy",
    },
    {
      dateIso: "2026-02-04",
      minTempC: 22,
      maxTempC: 30,
      condition: "Sunny",
    },
    {
      dateIso: "2026-02-05",
      minTempC: 20,
      maxTempC: 27,
      condition: "Rain",
    },
    {
      dateIso: "2026-02-06",
      minTempC: 21,
      maxTempC: 29,
      condition: "Windy",
    },
    {
      dateIso: "2026-02-07",
      minTempC: 23,
      maxTempC: 31,
      condition: "Sunny",
    },
  ],
};

describe("WeatherPage", () => {
  beforeEach(() => {
    mockedStore.value = createStore();
  });

  it("displays the initial loading state", () => {
    mockedStore.value = createStore({
      isLoading: true,
      hasWeatherData: false,
    });

    const wrapper = mountWeatherPage();

    expect(wrapper.text()).toContain("Loading weather");
  });

  it("displays an API error message and retry button", () => {
    mockedStore.value = createStore({
      error: {
        code: "CITY_NOT_FOUND",
        message: "City not found. Please enter a valid city name.",
      },
    });

    const wrapper = mountWeatherPage();

    expect(wrapper.text()).toContain("City not found. Please enter a valid city name.");
    expect(wrapper.get("button[type='button']").text()).toContain("Refresh");
    expect(wrapper.text()).toContain("Retry");
  });

  it("displays successful weather data", () => {
    mockedStore.value = createStore({
      currentCity: "Bengaluru",
      currentWeather,
      forecast,
      hasWeatherData: true,
    });

    const wrapper = mountWeatherPage();

    expect(wrapper.text()).toContain("Bengaluru, IN");
    expect(wrapper.text()).toContain("29°C");
    expect(wrapper.text()).toContain("Partly Cloudy");
    expect(wrapper.text()).toContain("62%");
    expect(wrapper.text()).toContain("10 km/h");
    expect(wrapper.text()).toContain("5-Day Forecast");
  });

  it("calls refreshWeather when the Refresh button is clicked", async () => {
    const refreshWeather = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    mockedStore.value = createStore({
      refreshWeather,
    });

    const wrapper = mountWeatherPage();
    const refreshButton = wrapper
      .findAll("button")
      .find((button) => button.text().includes("Refresh"));

    expect(refreshButton).toBeDefined();

    await refreshButton?.trigger("click");

    expect(refreshWeather).toHaveBeenCalledTimes(1);
  });
});
