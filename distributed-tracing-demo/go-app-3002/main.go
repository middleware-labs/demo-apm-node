package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/mux"

	track "github.com/middleware-labs/golang-apm/tracker"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gorilla/mux/otelmux"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	oteltrace "go.opentelemetry.io/otel/trace"
)

var tracer = otel.Tracer("mux-server-1")

func main() {
	config, _ := track.Track(
		track.WithConfigTag("service", "missing-go-app-3002"),
		track.WithConfigTag("projectName", "distributed-tracing-demo"),
		track.WithConfigTag("accessToken", "<MW_API_KEY>"),
		track.WithConfigTag("target", "<MW_UID>.middleware.io:443"),
	)
	tp := config.Tp
	r := mux.NewRouter()
	r.Use(otelmux.Middleware("mux-server-3002", otelmux.WithTracerProvider(tp)))

	r.HandleFunc("/endpoint", handleEndpoint)
	http.Handle("/", r)
	fmt.Println("Server is running on :3002")
	err := http.ListenAndServe(":3002", nil)
	fmt.Println("error", err)
}

func handleEndpoint(w http.ResponseWriter, r *http.Request) {
	fmt.Println("request recieved 3")
	ctx := r.Context()
	resp := forwardRequest(ctx)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func forwardRequest(ctx context.Context) map[string]interface{} {
	_, span := tracer.Start(ctx, "forwardRequest", oteltrace.WithAttributes(attribute.String("to", "gin-app-3003")))
	defer span.End()

	request, _ := http.NewRequestWithContext(ctx, "GET", "http://localhost:3003/endpoint", nil)

	client := http.Client{
		Transport: otelhttp.NewTransport(http.DefaultTransport),
		Timeout:   10 * time.Second,
	}
	resp, err := client.Do(request)
	if err != nil {
		fmt.Println("Error forwarding request:", err)
		return map[string]interface{}{"error": "Failed to forward request"}
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	return result
}
